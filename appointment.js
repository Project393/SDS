/* ==========================================================================
   Sangani Design Studio — Appointment Builder & WhatsApp Redirect
   ========================================================================== */

(function () {
  "use strict";

  const STUDIO_WA_DIGITS = "917622005681";

  function toLocalISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
    }
    return fallbackCopyText(text);
  }

  function fallbackCopyText(text) {
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Scroll Progress Bar & Autohiding Header
  const progressBar = document.getElementById("scroll-progress");
  const header = document.getElementById("site-header");
  let targetProgress = 0;
  let currentProgress = 0;
  let lastScrollY = window.scrollY || 0;
  let isHeaderHidden = false;

  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      targetProgress =
        docHeight > 0 ? Math.min(1, Math.max(0, currentScrollY / docHeight)) : 0;

      if (header) {
        header.classList.toggle("scrolled", currentScrollY > 36);
        const delta = currentScrollY - lastScrollY;
        if (currentScrollY > 90 && delta > 6 && !isHeaderHidden) {
          header.classList.add("header-hidden");
          isHeaderHidden = true;
        } else if ((delta < -6 || currentScrollY <= 40) && isHeaderHidden) {
          header.classList.remove("header-hidden");
          isHeaderHidden = false;
        }
      }

      lastScrollY = currentScrollY;
    },
    { passive: true }
  );

  function tickProgress() {
    currentProgress += (targetProgress - currentProgress) * 0.16;
    if (progressBar) {
      progressBar.style.transform = `scaleX(${currentProgress.toFixed(4)})`;
    }
    requestAnimationFrame(tickProgress);
  }
  requestAnimationFrame(tickProgress);

  // Reveal observer
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal-item").forEach((el) => revealObserver.observe(el));

  // Form state
  const state = {
    service: "Luxury Interior Design",
    propertyType: "Residential Villa / Bungalow",
    areaSqFt: "",
    budget: "₹15L – ₹35 Lakhs",
    mode: "Studio Visit (Vapi)",
    preferredDate: "",
    timeSlot: "12:00 PM",
    fullName: "",
    clientPhone: "",
    city: "Vapi",
    notes: "",
  };

  // Elements
  const dateInput = document.getElementById("preferredDate");
  const areaInput = document.getElementById("areaSqFt");
  const fullNameInput = document.getElementById("fullName");
  const phoneInput = document.getElementById("clientPhone");
  const cityInput = document.getElementById("city");
  const notesInput = document.getElementById("notes");

  const sumService = document.getElementById("sum-service");
  const sumProperty = document.getElementById("sum-property");
  const sumBudget = document.getElementById("sum-budget");
  const sumSchedule = document.getElementById("sum-schedule");
  const sumMode = document.getElementById("sum-mode");
  const previewEl = document.getElementById("whatsapp-preview");

  const errorBox = document.getElementById("form-error");
  const errorText = document.getElementById("form-error-text");
  const successBox = document.getElementById("redirect-success");
  const directWaLink = document.getElementById("direct-wa-link");
  const formEl = document.getElementById("appointment-form");
  const summaryPanel = document.getElementById("summary-panel");
  const mobileStickyCta = document.getElementById("mobile-sticky-cta");
  const mobileStickyService = document.getElementById("mobile-sticky-service");
  const mobileStickyMeta = document.getElementById("mobile-sticky-meta");

  // Default date = tomorrow, min = today (local timezone)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayISO = toLocalISODate(today);
  const tomorrowISO = toLocalISODate(tomorrow);

  if (dateInput) {
    dateInput.min = todayISO;
    dateInput.value = tomorrowISO;
    state.preferredDate = tomorrowISO;
  }

  // Apply URL query parameters if linked from a service or project
  const params = new URLSearchParams(window.location.search);
  const presetService = params.get("service");
  const presetRef = params.get("ref");

  if (presetService) {
    const matchBtn = Array.from(document.querySelectorAll("[data-service]")).find(
      (btn) => btn.dataset.service.toLowerCase() === presetService.toLowerCase()
    );
    if (matchBtn) {
      document.querySelectorAll("[data-service]").forEach((b) => b.classList.remove("active"));
      matchBtn.classList.add("active");
      state.service = matchBtn.dataset.service;
    } else {
      state.service = presetService;
    }
  }

  if (presetRef && notesInput) {
    state.notes = `Inspired by project: ${presetRef}`;
    notesInput.value = state.notes;
  }

  function formatDateDisplay(isoDate) {
    if (!isoDate) return "Flexible";
    const parsed = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return parsed.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function buildWhatsAppMessage() {
    const lines = [
      "Hello Ar. Parthit Sangani (Sangani Design Studio),",
      "I would like to book an architectural / interior design consultation.",
      "",
      "*Client Details*",
      `• Name: ${state.fullName.trim() || "[Your Name]"}`,
      `• Phone: ${state.clientPhone.trim() || "[Your Phone]"}`,
      `• Location / City: ${state.city.trim() || "Vapi"}`,
      "",
      "*Project Brief*",
      `• Service: ${state.service}`,
      `• Property Type: ${state.propertyType}`,
      state.areaSqFt.trim() ? `• Approx. Area: ${state.areaSqFt.trim()} sq.ft` : null,
      `• Budget Range: ${state.budget}`,
      "",
      "*Preferred Appointment*",
      `• Mode: ${state.mode}`,
      `• Date: ${formatDateDisplay(state.preferredDate)}`,
      `• Time Slot: ${state.timeSlot}`,
      state.notes.trim() ? `• Notes: ${state.notes.trim()}` : null,
      "",
      "Looking forward to connecting with Sangani Design Studio.",
    ].filter((line) => line !== null);

    return lines.join("\n");
  }

  function updateSummaryAndPreview() {
    const scheduleLabel = `${formatDateDisplay(state.preferredDate)} • ${state.timeSlot}`;
    if (sumService) sumService.textContent = state.service;
    if (sumProperty) sumProperty.textContent = state.propertyType;
    if (sumBudget) sumBudget.textContent = state.budget;
    if (sumSchedule) sumSchedule.textContent = scheduleLabel;
    if (sumMode) sumMode.textContent = state.mode;
    if (previewEl) previewEl.textContent = buildWhatsAppMessage();
    if (mobileStickyService) mobileStickyService.textContent = state.service;
    if (mobileStickyMeta) mobileStickyMeta.textContent = scheduleLabel;
  }

  function clearError() {
    if (errorBox) errorBox.classList.add("hidden");
    if (fullNameInput) fullNameInput.classList.remove("input-invalid");
    if (phoneInput) phoneInput.classList.remove("input-invalid");
  }

  function showError(msg, targetInput) {
    if (errorBox && errorText) {
      errorText.textContent = msg;
      errorBox.classList.remove("hidden");
    }
    if (targetInput) {
      targetInput.classList.add("input-invalid");
      targetInput.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => targetInput.focus({ preventScroll: true }), 220);
    }
  }

  // Auto-hide mobile sticky CTA once the full Consultation Summary panel is reached
  function updateMobileStickyVisibility() {
    if (!mobileStickyCta || !summaryPanel) return;
    const summaryReached =
      summaryPanel.getBoundingClientRect().top <= window.innerHeight - 90;
    mobileStickyCta.classList.toggle("is-hidden", summaryReached);
  }

  if (mobileStickyCta && summaryPanel) {
    window.addEventListener("scroll", updateMobileStickyVisibility, { passive: true });
    window.addEventListener("resize", updateMobileStickyVisibility, { passive: true });
    updateMobileStickyVisibility();
  }

  // Option group bindings
  function bindButtonGroup(selector, dataAttr, stateKey) {
    const buttons = Array.from(document.querySelectorAll(selector));
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state[stateKey] = btn.dataset[dataAttr] || "";
        updateSummaryAndPreview();
      });
    });
  }

  bindButtonGroup("#service-options .option-card", "service", "service");
  bindButtonGroup("#property-options .pill-choice", "property", "propertyType");
  bindButtonGroup("#budget-options .budget-choice", "budget", "budget");
  bindButtonGroup("#mode-options .mode-card", "mode", "mode");
  bindButtonGroup("#slot-options .slot-btn", "slot", "timeSlot");

  // Input listeners
  if (areaInput) {
    areaInput.addEventListener("input", () => {
      state.areaSqFt = areaInput.value;
      updateSummaryAndPreview();
    });
  }
  if (dateInput) {
    dateInput.addEventListener("change", () => {
      state.preferredDate = dateInput.value;
      updateSummaryAndPreview();
    });
  }
  if (fullNameInput) {
    fullNameInput.addEventListener("input", () => {
      state.fullName = fullNameInput.value;
      clearError();
      updateSummaryAndPreview();
    });
  }
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      state.clientPhone = phoneInput.value;
      clearError();
      updateSummaryAndPreview();
    });
  }
  if (cityInput) {
    cityInput.addEventListener("input", () => {
      state.city = cityInput.value;
      updateSummaryAndPreview();
    });
  }
  if (notesInput) {
    notesInput.addEventListener("input", () => {
      state.notes = notesInput.value;
      updateSummaryAndPreview();
    });
  }

  // Submit & Redirect to WhatsApp
  if (formEl) {
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!state.fullName.trim()) {
        showError(
          "Please enter your full name so we can personalize your WhatsApp booking.",
          fullNameInput
        );
        return;
      }

      const digitsOnly = state.clientPhone.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        showError(
          "Please enter a valid 10-digit phone or WhatsApp number.",
          phoneInput
        );
        return;
      }

      clearError();
      const message = buildWhatsAppMessage();
      const waUrl = `https://wa.me/${STUDIO_WA_DIGITS}?text=${encodeURIComponent(message)}`;

      if (directWaLink) directWaLink.href = waUrl;
      if (successBox) {
        successBox.classList.remove("hidden");
        successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      const popup = window.open(waUrl, "_blank");
      if (popup) {
        popup.opener = null;
      } else {
        window.location.href = waUrl;
      }
    });
  }

  updateSummaryAndPreview();
})();
