# Creative Developer Portfolio

A responsive personal portfolio built with plain HTML, CSS, browser JavaScript,
and a small Node.js server. No packages are required.

The site is published at [https://dsharmalang.github.io](https://dsharmalang.github.io)
with GitHub Pages. The deployment workflow publishes the `Public/` directory
whenever changes are pushed to `main`.

## Run locally

Install Node.js 18 or later, then run:

```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000). Set the `PORT` environment
variable to choose another port.

## Contact

The hosted site links to the GitHub profile because GitHub Pages cannot run the
Node.js contact API. When running locally, `POST /api/contact` accepts a JSON
object with `name`, `email`, `message`, and `consent: true`. The server validates
submissions, limits each IP address to five messages per hour, and appends valid
messages to `data/messages.jsonl`. Messages are not emailed; check the server's
private data file to read them.

## Privacy

The public portfolio avoids exact birth date, school, and neighborhood details.
