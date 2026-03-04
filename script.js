// SCRIPT.JS

// ===========================
// Load EmailJS safely
// ===========================
function loadEmailJSSDK() {
  return new Promise((resolve, reject) => {
    if (typeof window.emailjs !== "undefined") return resolve();

    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load EmailJS SDK"));
    document.head.appendChild(s);
  });
}

// ===========================
// Premium UX Helpers
// ===========================
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setupScrollReveal() {
  const reduce = prefersReducedMotion();

  // Add reveal class to elements without changing your HTML structure
  const revealSelectors = [
    ".section__head",
    ".panel",
    ".panel--feature",
    ".step",
    ".quote",
    ".stat",
    ".chip",
    ".bulletbox",
    ".callout",
    ".stack__item",
    ".leadbox",
    ".form",
    ".finalcta",
    ".trust__item",
    ".hero__note",
    ".card",
  ];

  const els = new Set();
  revealSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => els.add(el));
  });

  // Hero cinematic staging
  const heroStage = document.querySelectorAll(
    ".hero__content .pill, .hero__content h1, .hero__content .lead, .hero__cta, .trust"
  );
  heroStage.forEach((el) => els.add(el));

  // Apply base reveal class + stagger
  let i = 0;
  els.forEach((el) => {
    el.classList.add("reveal");
    el.style.setProperty("--d", `${Math.min(i * 55, 420)}ms`);
    i++;
  });

  if (reduce) {
    // If reduced motion, just show everything
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  els.forEach((el) => io.observe(el));
}

function setupMagneticButtons() {
  if (prefersReducedMotion()) return;

  const buttons = document.querySelectorAll(".btn");
  const strength = 10; // subtle premium pull

  const isFinePointer =
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!isFinePointer) return;

  buttons.forEach((btn) => {
    btn.classList.add("magnetic");

    function onMove(e) {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
    }

    function onLeave() {
      btn.style.transform = "";
    }

    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
  });
}

function setupCursorGlow() {
  const reduce = prefersReducedMotion();
  if (reduce) return;

  const isFinePointer =
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!isFinePointer) return;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.appendChild(glow);

  let raf = null;
  let tx = 0,
    ty = 0;
  let x = 0,
    y = 0;

  const speed = 0.14;

  function loop() {
    x += (tx - x) * speed;
    y += (ty - y) * speed;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
  });

  window.addEventListener("pointerdown", () => glow.classList.add("cursor-glow--active"));
  window.addEventListener("pointerup", () => glow.classList.remove("cursor-glow--active"));
}

function setupSmoothAnchorOffset() {
  // Smooth scroll already exists via CSS; this ensures header offset feels better
  // without changing your markup. It only triggers on in-page anchor clicks.
  const header = document.querySelector(".header");
  const headerOffset = header ? header.offsetHeight + 52 : 96;

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const id = a.getAttribute("href");
    if (!id || id === "#") return;

    const target = document.querySelector(id);
    if (!target) return;

    // Let normal behavior occur for #top (nice)
    if (id === "#top") return;

    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Current year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Premium enhancements
  setupScrollReveal();
  setupMagneticButtons();
  setupCursorGlow();
  setupSmoothAnchorOffset();

  // Mobile menu toggle
  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.hidden = isOpen;
    });

    // Close mobile menu when clicking a link
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        burger.setAttribute("aria-expanded", "false");
        mobileMenu.hidden = true;
      });
    });
  }

  // FAQ Accordion
  const accordion = document.querySelector("[data-accordion]");
  if (accordion) {
    const buttons = accordion.querySelectorAll(".acc");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        const expanded = btn.getAttribute("aria-expanded") === "true";

        // Close all
        buttons.forEach((b) => {
          b.setAttribute("aria-expanded", "false");
          const p = b.nextElementSibling;
          if (p && p.classList.contains("acc__panel")) p.style.maxHeight = "0px";
          const icon = b.querySelector(".acc__icon");
          if (icon) icon.textContent = "+";
        });

        // Open current if it was closed
        if (!expanded && panel && panel.classList.contains("acc__panel")) {
          btn.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
          const icon = btn.querySelector(".acc__icon");
          if (icon) icon.textContent = "–";
        }
      });
    });
  }

  // ===========================
  // EmailJS Lead Form
  // ===========================
  const leadForm = document.getElementById("leadForm");
  const formSuccess = document.getElementById("formSuccess");

  const submitBtn = leadForm ? leadForm.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.textContent : "Book My Free AI Demo";

  if (!leadForm) {
    console.error("leadForm not found (id='leadForm' missing).");
    return;
  }

  try {
    await loadEmailJSSDK();
    emailjs.init("BWt4ViVS9uaoDvS3H");
  } catch (err) {
    console.error(err);
    alert("Email service failed to load. Check your internet and try again.");
    return;
  }

  leadForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (formSuccess) formSuccess.hidden = true;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    // Premium micro-feedback
    leadForm.classList.add("is-sending");

    emailjs
      .sendForm("service_gxu73ka", "template_77itw6n", this)
      .then(() => {
        if (formSuccess) formSuccess.hidden = false;
        leadForm.reset();

        if (submitBtn) submitBtn.textContent = "Sent ✅";
        setTimeout(() => {
          if (submitBtn) submitBtn.textContent = originalBtnText;
        }, 1000);

        setTimeout(() => {
          formSuccess?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      })
      .catch((error) => {
        console.error("EmailJS error:", error);
        alert("❌ Failed to send. Open Console to see the error details.");
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
        leadForm.classList.remove("is-sending");
      });
  });
});
