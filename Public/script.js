const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const yearElement = document.querySelector("#current-year");
const heroArt = document.querySelector(".hero-art");
const heroScene = document.querySelector(".hero-scene");

yearElement.textContent = String(new Date().getFullYear());

if (heroArt && heroScene && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  heroArt.addEventListener("pointermove", (event) => {
    const bounds = heroArt.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroScene.style.setProperty("--tilt-x", `${-offsetY * 9}deg`);
    heroScene.style.setProperty("--tilt-y", `${offsetX * 11}deg`);
  });

  heroArt.addEventListener("pointerleave", () => {
    heroScene.style.setProperty("--tilt-x", "0deg");
    heroScene.style.setProperty("--tilt-y", "0deg");
  });
}
menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
  }
});

if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("reveal-ready");
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll(".about, .skills-heading, .skill-card, .contact").forEach((section) => {
    section.classList.add("reveal");
    observer.observe(section);
  });
}
