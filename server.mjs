import { appendFile, mkdir, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = fileURLToPath(new URL(".", import.meta.url));
const publicDirectory = resolve(projectDirectory, "Public");
const dataDirectory = resolve(projectDirectory, "data");
const messagesFile = join(dataDirectory, "messages.jsonl");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const maxRequestBytes = 8 * 1024;
const submissionLimit = 5;
const submissionWindowMs = 60 * 60 * 1000;
const submissionsByAddress = new Map();

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(payload));
}

function isRateLimited(address, now) {
  const recentSubmissions = (submissionsByAddress.get(address) ?? []).filter(
    (timestamp) => now - timestamp < submissionWindowMs,
  );

  if (recentSubmissions.length >= submissionLimit) {
    submissionsByAddress.set(address, recentSubmissions);
    return true;
  }

  recentSubmissions.push(now);
  submissionsByAddress.set(address, recentSubmissions);
  return false;
}

async function readRequestBody(request) {
  let body = "";
  let oversized = false;

  for await (const chunk of request) {
    body += chunk.toString("utf8");
    if (Buffer.byteLength(body, "utf8") > maxRequestBytes) {
      oversized = true;
      break;
    }
  }

  if (oversized) {
    request.resume();
    return null;
  }

  return body;
}

async function handleContact(request, response) {
  if (!request.headers["content-type"]?.includes("application/json")) {
    sendJson(response, 415, { error: "Send the form as JSON." });
    return;
  }

  const address = request.socket.remoteAddress ?? "unknown";
  if (isRateLimited(address, Date.now())) {
    sendJson(response, 429, {
      error: "Too many messages. Please try again in an hour.",
    });
    request.resume();
    return;
  }

  const body = await readRequestBody(request);
  if (body === null) {
    sendJson(response, 413, { error: "Your message is too large." });
    return;
  }

  let submission;
  try {
    submission = JSON.parse(body);
  } catch {
    sendJson(response, 400, { error: "The message could not be read." });
    return;
  }

  const name = typeof submission?.name === "string" ? submission.name.trim() : "";
  const email =
    typeof submission?.email === "string" ? submission.email.trim() : "";
  const message =
    typeof submission?.message === "string" ? submission.message.trim() : "";

  if (
    name.length < 1 ||
    name.length > 80 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    message.length < 1 ||
    message.length > 3000 ||
    submission?.consent !== true
  ) {
    sendJson(response, 400, {
      error: "Add a valid name, email and message, and agree to the storage note.",
    });
    return;
  }

  try {
    await mkdir(dataDirectory, { recursive: true });
    await appendFile(
      messagesFile,
      `${JSON.stringify({
        name,
        email,
        message,
        receivedAt: new Date().toISOString(),
      })}\n`,
      { encoding: "utf8", mode: 0o600 },
    );
  } catch (error) {
    console.error("Could not save contact submission:", error);
    sendJson(response, 500, {
      error: "Your message could not be saved. Please try again later.",
    });
    return;
  }

  sendJson(response, 201, { message: "Thanks — your message has been saved." });
}

async function handleStaticFile(request, response, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = resolve(publicDirectory, `.${requestedPath}`);
  if (
    filePath !== publicDirectory &&
    !filePath.startsWith(`${publicDirectory}${sep}`)
  ) {
    response.writeHead(404).end("Not found");
    return;
  }

  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }

    const contents = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes.get(extname(filePath)) ?? "application/octet-stream",
      "Content-Length": contents.length,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy":
        "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    });
    response.end(request.method === "HEAD" ? undefined : contents);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      response.writeHead(404).end("Not found");
      return;
    }
    console.error(`Could not serve ${filePath}:`, error);
    response.writeHead(500).end("Internal server error");
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");

  if (request.method === "POST" && requestUrl.pathname === "/api/contact") {
    await handleContact(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    await handleStaticFile(request, response, requestUrl.pathname);
    return;
  }

  response.writeHead(405, { Allow: "GET, HEAD, POST" }).end("Method not allowed");
});

server.listen(port, () => {
  console.log(`Portfolio running at http://localhost:${port}`);
});
