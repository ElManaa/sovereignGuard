/* ============================================================
   Sovereign Guard — Landing page interactions
   ============================================================ */

/* ------------------------------------------------------------
   CONFIG — where form submissions go.

   Option A (recommended, zero backend): create a free form at
   https://formspree.io  (or similar) and paste the endpoint URL
   below. Both the contact form and newsletter will POST JSON to it.

   Option B: point this at your own API endpoint that accepts JSON.

   If left empty, the page falls back to opening the visitor's email
   client (mailto) so no submission is ever lost.
   ------------------------------------------------------------ */
const CONFIG = {
  FORM_ENDPOINT: "", // e.g. "https://formspree.io/f/xxxxxxxx"
  CONTACT_EMAIL: "hello@sovereignguard.eu",
};

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Sticky nav state ---------- */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Mobile menu ---------- */
const navToggle = document.getElementById("navToggle");
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll(".nav__links a, .nav__actions a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min((i % 3) * 80, 240)}ms`;
    io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Helpers ---------- */
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function setStatus(el, msg, type) {
  el.textContent = msg;
  el.classList.remove("is-ok", "is-err");
  if (type) el.classList.add(type === "ok" ? "is-ok" : "is-err");
}

async function postJSON(payload) {
  if (!CONFIG.FORM_ENDPOINT) {
    return { ok: false, fallback: true };
  }
  try {
    const res = await fetch(CONFIG.FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, fallback: false };
  } catch (e) {
    return { ok: false, fallback: false, error: e };
  }
}

function mailtoFallback(subject, body) {
  const url = `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

/* ---------- Contact form ---------- */
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");
const contactSubmit = document.getElementById("contactSubmit");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const company = contactForm.company.value.trim();
  const role = contactForm.role.value;
  const message = contactForm.message.value.trim();
  const newsletter = contactForm.newsletter.checked;

  // Validate
  let valid = true;
  contactForm.name.classList.toggle("invalid", !name);
  contactForm.email.classList.toggle("invalid", !isEmail(email));
  if (!name || !isEmail(email)) valid = false;
  if (!valid) {
    setStatus(contactStatus, "Please add your name and a valid work email.", "err");
    return;
  }

  const payload = {
    _subject: `Sovereign Guard demo request — ${name}${company ? " @ " + company : ""}`,
    type: "demo_request",
    name,
    email,
    company,
    role,
    message,
    newsletter,
    submittedAt: new Date().toISOString(),
  };

  contactSubmit.disabled = true;
  setStatus(contactStatus, "Sending…", null);

  const result = await postJSON(payload);

  if (result.ok) {
    contactForm.reset();
    setStatus(contactStatus, "Thanks — we'll be in touch within 48 hours.", "ok");
  } else if (result.fallback) {
    setStatus(contactStatus, "Opening your email app to send…", "ok");
    mailtoFallback(
      payload._subject,
      `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nRole: ${role}\nNewsletter: ${newsletter ? "yes" : "no"}\n\n${message}`
    );
  } else {
    setStatus(contactStatus, "Something went wrong. Email us at " + CONFIG.CONTACT_EMAIL, "err");
  }
  contactSubmit.disabled = false;
});

/* ---------- Newsletter form ---------- */
const newsletterForm = document.getElementById("newsletterForm");
const newsletterStatus = document.getElementById("newsletterStatus");
const newsletterEmail = document.getElementById("newsletterEmail");

newsletterForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = newsletterEmail.value.trim();
  if (!isEmail(email)) {
    setStatus(newsletterStatus, "Please enter a valid email address.", "err");
    return;
  }

  const payload = {
    _subject: "Sovereign Guard newsletter signup",
    type: "newsletter_signup",
    email,
    submittedAt: new Date().toISOString(),
  };

  const btn = newsletterForm.querySelector("button");
  btn.disabled = true;
  setStatus(newsletterStatus, "Subscribing…", null);

  const result = await postJSON(payload);

  if (result.ok) {
    newsletterForm.reset();
    setStatus(newsletterStatus, "You're in. Welcome aboard 🎉", "ok");
  } else if (result.fallback) {
    setStatus(newsletterStatus, "Opening your email app to confirm…", "ok");
    mailtoFallback(payload._subject, `Please subscribe me to the Sovereign Guard newsletter.\nEmail: ${email}`);
  } else {
    setStatus(newsletterStatus, "Something went wrong. Try again or email " + CONFIG.CONTACT_EMAIL, "err");
  }
  btn.disabled = false;
});
