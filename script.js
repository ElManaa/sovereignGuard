/* ============================================================
   Sovereign Guard — Landing page interactions
   ============================================================ */

/* ------------------------------------------------------------
   CONFIG — fill in these three values and everything works.

   FORM_ENDPOINT  ── Formspree contact form endpoint.
     1. Sign up free at https://formspree.io
     2. Create a new form → copy the endpoint URL
     3. Paste it below, e.g. "https://formspree.io/f/abcdefgh"
     Contact form AND newsletter submissions go here.

   CAL_URL  ── Cal.com booking link for "Book a demo" buttons.
     1. Sign up free at https://cal.com
     2. Connect your Google/Outlook calendar
     3. Create a "30-min demo" event type
     4. Copy your link, e.g. "https://cal.com/sovereignguard/demo"

   BREVO_API_KEY + BREVO_LIST_ID  ── Brevo (ex-Sendinblue) newsletter.
     1. Sign up free at https://brevo.com (EU servers, GDPR-compliant)
     2. Go to Settings → API Keys → create a key
     3. Go to Contacts → Lists → create a "Newsletter" list → note its ID (number)
     4. Paste both below
     If left empty, newsletter falls back to Formspree (also fine).

   Leave any field empty to fall back gracefully — the contact
   form opens the visitor's email client, booking opens the raw URL.
   ------------------------------------------------------------ */
const CONFIG = {
  // ── Contact form (Formspree) ────────────────────────────────
  FORM_ENDPOINT: "https://formspree.io/f/xrevnawd",  

  // ── Demo booking (Cal.com) ──────────────────────────────────
  CAL_URL: "https://cal.com/elmanaa-houssem-688gt9/30-minutes-call",  
  // ── Newsletter (Brevo) ─────────────────────────────────────
  BREVO_API_KEY: "", // your Brevo API key
  BREVO_LIST_ID: 0,  // your Brevo list ID (integer)

  // ── Fallback email ─────────────────────────────────────────
  CONTACT_EMAIL: "hello@sovereignguard.eu",
};

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Cal.com — wire all "Book a demo" buttons ---------- */
document.querySelectorAll('a[href="#demo"]').forEach((btn) => {
  // Only intercept the nav + hero CTAs that say "Book a demo",
  // not the anchor link to the contact section itself.
  if (btn.textContent.trim().toLowerCase().includes("book")) {
    btn.addEventListener("click", (e) => {
      if (CONFIG.CAL_URL) {
        e.preventDefault();
        window.open(CONFIG.CAL_URL, "_blank", "noopener,noreferrer");
      }
      // If no CAL_URL set, fall through to the #demo section anchor
    });
  }
});

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

async function subscribeBrevo(email) {
  if (!CONFIG.BREVO_API_KEY || !CONFIG.BREVO_LIST_ID) return { ok: false, noConfig: true };
  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": CONFIG.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [CONFIG.BREVO_LIST_ID],
        updateEnabled: true, // re-add if contact already exists
        attributes: { SOURCE: "landing_page" },
      }),
    });
    // 201 = created, 204 = updated (already existed)
    return { ok: res.status === 201 || res.status === 204 };
  } catch (e) {
    return { ok: false };
  }
}

newsletterForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = newsletterEmail.value.trim();
  if (!isEmail(email)) {
    setStatus(newsletterStatus, "Please enter a valid email address.", "err");
    return;
  }

  const btn = newsletterForm.querySelector("button");
  btn.disabled = true;
  setStatus(newsletterStatus, "Subscribing…", null);

  // Try Brevo first
  const brevoResult = await subscribeBrevo(email);
  if (brevoResult.ok) {
    newsletterForm.reset();
    setStatus(newsletterStatus, "You're in. Welcome aboard 🎉", "ok");
    btn.disabled = false;
    return;
  }

  // Fall back to Formspree
  const payload = {
    _subject: "Sovereign Guard newsletter signup",
    type: "newsletter_signup",
    email,
    submittedAt: new Date().toISOString(),
  };
  const result = await postJSON(payload);

  if (result.ok) {
    newsletterForm.reset();
    setStatus(newsletterStatus, "You're in. Welcome aboard 🎉", "ok");
  } else if (result.fallback || brevoResult.noConfig) {
    setStatus(newsletterStatus, "Opening your email app to confirm…", "ok");
    mailtoFallback("Subscribe me to Sovereign Guard updates", `Please add me to the newsletter.\nEmail: ${email}`);
  } else {
    setStatus(newsletterStatus, "Something went wrong. Try again or email " + CONFIG.CONTACT_EMAIL, "err");
  }
  btn.disabled = false;
});
