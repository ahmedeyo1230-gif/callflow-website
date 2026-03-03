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

document.addEventListener("DOMContentLoaded", async () => {
  // Current year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
      });
  });
});