/* ==========================================================================
   Sangani Design Studio — Vanilla JavaScript Interactions & Animations
   ========================================================================== */

(function () {
  "use strict";

  const PROJECTS = [
    {
      id: "courtyard-pavilion",
      title: "The Sunlit Courtyard Residence",
      category: "Interiors",
      location: "Vapi, Gujarat",
      area: "4,800 sq.ft",
      year: "2026",
      image: "./images/hero-living.jpg",
      summary:
        "A double-height living sanctuary anchored by raw travertine walls, vertical bronze-stained teak louvers, and seamless indoor-outdoor tropical courtyard framing.",
      palette: ["Honed Travertine", "Fluted Teak", "Brushed Brass", "Linen Bouclé"],
      serviceType: "Luxury Interior Design",
    },
    {
      id: "kiran-villa",
      title: "Cantilever Horizon Villa",
      category: "Architecture",
      location: "Daman & Vapi Belt",
      area: "6,200 sq.ft",
      year: "2026",
      image: "./images/villa-facade.jpg",
      summary:
        "Dramatic cantilevered concrete volumes softened by warm Burma teak soffits, charcoal basalt cladding, and a tranquil dusk reflecting court.",
      palette: ["Exposed Concrete", "Charcoal Basalt", "Warm Teak Soffit", "Clear Low-E Glass"],
      serviceType: "Architectural Design",
    },
    {
      id: "monolith-dining",
      title: "Monolith Marble Culinary Suite",
      category: "Interiors",
      location: "Vapi, Gujarat",
      area: "1,650 sq.ft",
      year: "2025",
      image: "./images/kitchen-dining.jpg",
      summary:
        "An architectural kitchen-dining nexus anchored by a sculpted Calacatta island, espresso oak cabinetry, recessed brass hardware, and chevron timber flooring.",
      palette: ["Calacatta Marble", "Espresso Oak", "Aged Brass", "Chevron Timber"],
      serviceType: "Luxury Interior Design",
    },
    {
      id: "sun-trade-studio",
      title: "Atelier Executive Lounge",
      category: "Commercial",
      location: "G.I.D.C. Vapi",
      area: "3,400 sq.ft",
      year: "2025",
      image: "./images/commercial-lounge.jpg",
      summary:
        "A warm minimalist commercial workspace balancing exposed architectural concrete slabs with walnut acoustic paneling and monolithic stone hospitality.",
      palette: ["Architectural Concrete", "American Walnut", "Honed Limestone", "Warm Linear LED"],
      serviceType: "Commercial & Workspaces",
    },
    {
      id: "serenity-suite",
      title: "Limewash Sanctuary Master Suite",
      category: "Interiors",
      location: "Valsad, Gujarat",
      area: "980 sq.ft",
      year: "2026",
      image: "./images/master-suite.jpg",
      summary:
        "Quiet tactile luxury crafted with hand-troweled limewash plaster, floating teak joinery, sheer filtered daylight, and warm brass reading accents.",
      palette: ["Limewash Plaster", "Burma Teak", "Natural Oak", "Belgian Linen"],
      serviceType: "Luxury Interior Design",
    },
  ];

  // Refresh Lucide icons
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Safe clipboard helper with fallback for mobile in-app browsers
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

  // Year stamp
  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  refreshIcons();

  /* ------------------------------------------------------------------------
     1. Spring-Smoothed Scroll Progress Bar & Hero Parallax
     ------------------------------------------------------------------------ */
  const progressBar = document.getElementById("scroll-progress");
  const heroImg = document.getElementById("hero-parallax-img");
  const heroSection = document.getElementById("top");
  const header = document.getElementById("site-header");
  const scrollTopBtn = document.getElementById("scroll-top-btn");

  let targetProgress = 0;
  let currentProgress = 0;
  let lastScrollY = window.scrollY || 0;
  let isHeaderHidden = false;

  function updateScrollMetrics() {
    const currentScrollY = Math.max(0, window.scrollY);
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    targetProgress = docHeight > 0 ? Math.min(1, Math.max(0, currentScrollY / docHeight)) : 0;

    if (header) {
      header.classList.toggle("scrolled", currentScrollY > 36);

      const drawer = document.getElementById("mobile-drawer");
      const isDrawerOpen = Boolean(drawer && drawer.classList.contains("open"));

      if (!isDrawerOpen) {
        const delta = currentScrollY - lastScrollY;
        if (currentScrollY > 90 && delta > 6 && !isHeaderHidden) {
          header.classList.add("header-hidden");
          isHeaderHidden = true;
        } else if ((delta < -6 || currentScrollY <= 40) && isHeaderHidden) {
          header.classList.remove("header-hidden");
          isHeaderHidden = false;
        }
      }
    }

    lastScrollY = currentScrollY;

    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle("visible", currentScrollY > 420);
    }

    if (heroImg && heroSection) {
      const rect = heroSection.getBoundingClientRect();
      const total = heroSection.offsetHeight || 1;
      const ratio = Math.min(1, Math.max(0, -rect.top / total));
      const yShift = ratio * 14; // up to 14%
      const scale = 1 + ratio * 0.08;
      heroImg.style.transform = `translate3d(0, ${yShift.toFixed(2)}%, 0) scale(${scale.toFixed(3)})`;
    }
  }

  function tickProgress() {
    currentProgress += (targetProgress - currentProgress) * 0.16;
    if (progressBar) {
      progressBar.style.transform = `scaleX(${currentProgress.toFixed(4)})`;
    }
    requestAnimationFrame(tickProgress);
  }

  window.addEventListener("scroll", updateScrollMetrics, { passive: true });
  updateScrollMetrics();
  requestAnimationFrame(tickProgress);

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------------------
     2. Sliding Pill Indicator Helper (Replicates Framer Motion layoutId)
     ------------------------------------------------------------------------ */
  function positionSlidingPill(container, pill, activeEl) {
    if (!container || !pill || !activeEl) return;
    pill.style.left = `${activeEl.offsetLeft}px`;
    pill.style.top = `${activeEl.offsetTop}px`;
    pill.style.width = `${activeEl.offsetWidth}px`;
    pill.style.height = `${activeEl.offsetHeight}px`;
  }

  const desktopNav = document.getElementById("desktop-nav");
  const navPill = document.getElementById("nav-pill-bg");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const trackedSectionIds = ["top", "portfolio", "services", "architect", "contact"];

  function setActiveNavSection(sectionId) {
    let matchedLink = null;
    navLinks.forEach((link) => {
      const isMatch = link.dataset.section === sectionId;
      link.classList.toggle("active", isMatch);
      if (isMatch) matchedLink = link;
    });
    if (matchedLink) {
      positionSlidingPill(desktopNav, navPill, matchedLink);
    }
  }

  function detectActiveSection() {
    const scrollPos = window.scrollY + 180;
    for (let i = trackedSectionIds.length - 1; i >= 0; i--) {
      const el = document.getElementById(trackedSectionIds[i]);
      if (el && el.offsetTop <= scrollPos) {
        setActiveNavSection(trackedSectionIds[i]);
        break;
      }
    }
  }

  window.addEventListener("scroll", detectActiveSection, { passive: true });
  window.addEventListener("resize", () => {
    const activeNav = document.querySelector(".nav-link.active");
    positionSlidingPill(desktopNav, navPill, activeNav);
    const activeFilter = document.querySelector(".filter-btn.active");
    positionSlidingPill(
      document.getElementById("filter-bar"),
      document.getElementById("filter-pill-bg"),
      activeFilter
    );
  });

  // Initial pill placement after fonts settle
  function alignAllPills() {
    detectActiveSection();
    const activeFilter = document.querySelector(".filter-btn.active");
    positionSlidingPill(
      document.getElementById("filter-bar"),
      document.getElementById("filter-pill-bg"),
      activeFilter
    );
  }

  window.addEventListener("load", alignAllPills);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(alignAllPills);
  }
  setTimeout(alignAllPills, 80);

  /* ------------------------------------------------------------------------
     3. Mobile Navigation Drawer & Shared Scroll Lock
     ------------------------------------------------------------------------ */
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const mobileBackdrop = document.getElementById("mobile-drawer-backdrop");
  const menuOpenIcon = document.getElementById("menu-icon-open");
  const menuCloseIcon = document.getElementById("menu-icon-close");
  const modalBackdropEl = document.getElementById("project-modal");

  function syncBodyScrollLock() {
    const drawerOpen = Boolean(mobileDrawer && mobileDrawer.classList.contains("open"));
    const modalOpen = Boolean(modalBackdropEl && modalBackdropEl.classList.contains("open"));
    document.body.style.overflow = drawerOpen || modalOpen ? "hidden" : "";
  }

  function setDrawerOpen(open) {
    if (!mobileDrawer) return;
    if (open && header) {
      header.classList.remove("header-hidden");
      isHeaderHidden = false;
    }
    mobileDrawer.classList.toggle("open", open);
    mobileDrawer.setAttribute("aria-hidden", String(!open));
    if (mobileBackdrop) {
      mobileBackdrop.classList.toggle("open", open);
      mobileBackdrop.setAttribute("aria-hidden", String(!open));
    }
    if (menuToggleBtn) {
      menuToggleBtn.setAttribute("aria-expanded", String(open));
    }
    if (menuOpenIcon && menuCloseIcon) {
      menuOpenIcon.classList.toggle("hidden", open);
      menuCloseIcon.classList.toggle("hidden", !open);
    }
    syncBodyScrollLock();
  }

  if (menuToggleBtn && mobileDrawer) {
    menuToggleBtn.addEventListener("click", () => {
      setDrawerOpen(!mobileDrawer.classList.contains("open"));
    });

    mobileDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setDrawerOpen(false));
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener("click", () => setDrawerOpen(false));
  }

  /* ------------------------------------------------------------------------
     4. Scroll Reveal Observer (.reveal-item & .arch-rule)
     ------------------------------------------------------------------------ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.delay || 0);
          setTimeout(() => {
            entry.target.classList.add("is-visible");
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal-item, .arch-rule").forEach((el) => {
    revealObserver.observe(el);
  });

  /* ------------------------------------------------------------------------
     5. Portfolio Filter & Project Modal
     ------------------------------------------------------------------------ */
  const portfolioGrid = document.getElementById("portfolio-grid");
  const filterBar = document.getElementById("filter-bar");
  const filterPill = document.getElementById("filter-pill-bg");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));

  let activeCategory = "All";

  function renderProjects(category) {
    if (!portfolioGrid) return;

    const list =
      category === "All"
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === category);

    portfolioGrid.innerHTML = "";

    list.forEach((project, idx) => {
      const card = document.createElement("article");
      const isFeatured = idx === 0 && category === "All";
      card.className = `project-card reveal-item reveal-up${isFeatured ? " featured" : ""}`;
      card.dataset.projectId = project.id;

      card.innerHTML = `
        <div class="project-media">
          <img src="${project.image}" alt="${project.title}" loading="lazy" />
          <div class="project-gradient"></div>
          <span class="project-cat-badge">${project.category}</span>
          <span class="project-zoom-btn" aria-hidden="true">
            <i data-lucide="maximize-2" style="width: 16px; height: 16px"></i>
          </span>
          <div class="project-photo-meta">
            <span style="display: inline-flex; align-items: center; gap: 6px">
              <i data-lucide="map-pin" style="width: 14px; height: 14px; color: var(--bronze-light)"></i>
              ${project.location}
            </span>
            <span class="font-mono" style="font-size: 11px; color: var(--bronze-light)">
              ${project.area} • ${project.year}
            </span>
          </div>
        </div>
        <div class="project-body">
          <div>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-summary">${project.summary}</p>
          </div>
          <div class="project-footer">
            <div class="palette-chips">
              ${project.palette
                .slice(0, 2)
                .map((m) => `<span class="palette-chip">${m}</span>`)
                .join("")}
            </div>
            <span class="view-details-label">
              View Details
              <i data-lucide="arrow-up-right" style="width: 14px; height: 14px; color: var(--bronze)"></i>
            </span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => openProjectModal(project));
      portfolioGrid.appendChild(card);

      // Stagger entrance immediately
      setTimeout(() => {
        card.classList.add("is-visible");
      }, idx * 65 + 20);
    });

    refreshIcons();
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category || "All";
      if (cat === activeCategory) return;
      activeCategory = cat;

      filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
      positionSlidingPill(filterBar, filterPill, btn);
      if (typeof btn.scrollIntoView === "function" && window.innerWidth < 640) {
        btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
      renderProjects(cat);
    });
  });

  renderProjects("All");
  setTimeout(() => {
    positionSlidingPill(filterBar, filterPill, document.querySelector(".filter-btn.active"));
  }, 60);

  // Modal logic
  const modalBackdrop = document.getElementById("project-modal");
  const modalCard = document.getElementById("modal-card");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalImg = document.getElementById("modal-img");
  const modalMeta = document.getElementById("modal-meta");
  const modalTitle = document.getElementById("modal-title");
  const modalSummary = document.getElementById("modal-summary");
  const modalPalette = document.getElementById("modal-palette");
  const modalScope = document.getElementById("modal-scope");
  const modalInquireLink = document.getElementById("modal-inquire-link");

  function openProjectModal(project) {
    if (!modalBackdrop) return;
    modalImg.src = project.image;
    modalImg.alt = project.title;
    modalMeta.textContent = `${project.category} • ${project.location} • ${project.area}`;
    modalTitle.textContent = project.title;
    modalSummary.textContent = project.summary;
    modalScope.textContent = project.serviceType;

    modalPalette.innerHTML = project.palette
      .map(
        (mat) => `
        <span class="modal-material-pill">
          <i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: var(--bronze)"></i>
          ${mat}
        </span>`
      )
      .join("");

    const params = new URLSearchParams({
      service: project.serviceType,
      ref: project.title,
    });
    modalInquireLink.href = `./appointment.html?${params.toString()}`;

    modalBackdrop.classList.add("open");
    modalBackdrop.setAttribute("aria-hidden", "false");
    if (modalCard) modalCard.scrollTop = 0;
    syncBodyScrollLock();
    refreshIcons();
  }

  function closeProjectModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove("open");
    modalBackdrop.setAttribute("aria-hidden", "true");
    syncBodyScrollLock();
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeProjectModal);
  }
  if (modalBackdrop && modalCard) {
    modalBackdrop.addEventListener("click", (e) => {
      if (!modalCard.contains(e.target)) {
        closeProjectModal();
      }
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProjectModal();
      setDrawerOpen(false);
    }
  });

  /* ------------------------------------------------------------------------
     6. Process Step Selector
     ------------------------------------------------------------------------ */
  const processCards = Array.from(document.querySelectorAll(".process-card"));
  processCards.forEach((card) => {
    card.addEventListener("click", () => {
      processCards.forEach((c) => c.classList.toggle("active", c === card));
    });
  });

  /* ------------------------------------------------------------------------
     7. One-Click Copy Buttons (Phone & Email)
     ------------------------------------------------------------------------ */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.copy;
      if (!value) return;
      copyTextToClipboard(value).then(() => {
        const defIcon = btn.querySelector(".copy-icon-default");
        const doneIcon = btn.querySelector(".copy-icon-done");
        const label = btn.querySelector(".copy-label");
        if (defIcon) defIcon.classList.add("hidden");
        if (doneIcon) doneIcon.classList.remove("hidden");
        if (label) label.textContent = "Copied";
        setTimeout(() => {
          if (defIcon) defIcon.classList.remove("hidden");
          if (doneIcon) doneIcon.classList.add("hidden");
          if (label) label.textContent = "Copy";
        }, 2000);
      });
    });
  });
})();
