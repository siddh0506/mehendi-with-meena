const GALLERY_IMAGES = [
  { src: "./assets/gallery-01.png", alt: "Bridal portrait-style mehendi detail with intricate patterns" },
  { src: "./assets/gallery-02.png", alt: "Traditional mehendi artwork featuring detailed bands and motifs" },
  { src: "./assets/gallery-03.png", alt: "Full-hand bridal mehendi with dense floral and paisley patterns" },
  { src: "./assets/gallery-04.png", alt: "Story-style mehendi panels with illustrative figures and symbols" },
  { src: "./assets/gallery-05.png", alt: "Elegant traditional mehendi with floral borders and symmetry" },
  { src: "./assets/gallery-06.png", alt: "Close-up of hands with jewelry and a soft bridal aesthetic" },
];

const WHATSAPP_NUMBER = "919566442586";

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function initAOS() {
  if (!window.AOS) return;
  window.AOS.init({
    duration: 650,
    easing: "ease-out-cubic",
    once: true,
    offset: 90,
  });
}

function initOnLoadReveal() {
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-loaded");
  });
}

function initSmoothScroll() {
  $all("[data-scroll-to]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const target = el.getAttribute("data-scroll-to");
      const node = target ? document.querySelector(target) : null;
      if (!node) return;
      e.preventDefault();
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      document.body.classList.remove("nav-open");
      const toggle = $(".nav-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initMobileNav() {
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => {
    const open = !document.body.classList.contains("nav-open");
    setOpen(open);
  });

  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest(".site-nav") || t.closest(".nav-toggle")) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  $all(".site-nav a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });
}

function initLightbox() {
  const lb = $("[data-lightbox]");
  const lbImg = $("[data-lightbox-img]");
  const lbCaption = $("[data-lightbox-caption]");
  const closeBtns = $all("[data-lightbox-close]");
  const prevBtn = $("[data-lightbox-prev]");
  const nextBtn = $("[data-lightbox-next]");
  if (!lb || !lbImg || !lbCaption || !prevBtn || !nextBtn) return;

  let index = 0;
  let lastActive = null;

  function setOpen(open) {
    lb.classList.toggle("is-open", open);
    lb.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      preloadNeighbors();
      prevBtn.focus({ preventScroll: true });
    } else if (lastActive) {
      lastActive.focus({ preventScroll: true });
    }
  }

  function render() {
    const item = GALLERY_IMAGES[index];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCaption.textContent = item.alt;
  }

  function preloadNeighbors() {
    const next = new Image();
    next.src = GALLERY_IMAGES[(index + 1) % GALLERY_IMAGES.length].src;
    const prev = new Image();
    prev.src = GALLERY_IMAGES[(index - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length].src;
  }

  function go(delta) {
    index = (index + delta + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    render();
    preloadNeighbors();
  }

  $all("[data-gallery-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const raw = btn.getAttribute("data-gallery-index");
      const parsed = raw ? Number.parseInt(raw, 10) : 0;
      index = clamp(Number.isFinite(parsed) ? parsed : 0, 0, GALLERY_IMAGES.length - 1);
      lastActive = btn;
      render();
      setOpen(true);
    });
  });

  closeBtns.forEach((b) => b.addEventListener("click", () => setOpen(false)));
  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  // Swipe / drag feel (pointer events)
  let startX = 0;
  let activePointer = null;
  let dragX = 0;
  const threshold = 42;

  function onPointerDown(e) {
    if (!lb.classList.contains("is-open")) return;
    activePointer = e.pointerId;
    startX = e.clientX;
    dragX = 0;
    lbImg.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!lb.classList.contains("is-open")) return;
    if (activePointer !== e.pointerId) return;
    dragX = e.clientX - startX;
    lbImg.style.transform = `translateX(${dragX}px)`;
    lbImg.style.transition = "none";
  }

  function onPointerUp(e) {
    if (activePointer !== e.pointerId) return;
    lbImg.releasePointerCapture(e.pointerId);
    activePointer = null;
    lbImg.style.transition = "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)";
    lbImg.style.transform = "translateX(0)";
    if (Math.abs(dragX) > threshold) {
      go(dragX < 0 ? 1 : -1);
    }
  }

  lbImg.addEventListener("pointerdown", onPointerDown);
  lbImg.addEventListener("pointermove", onPointerMove);
  lbImg.addEventListener("pointerup", onPointerUp);
  lbImg.addEventListener("pointercancel", onPointerUp);
}

function initReviewsSlider() {
  const track = $("[data-reviews-track]");
  const dotsWrap = $("[data-reviews-dots]");
  const prev = $("[data-reviews-prev]");
  const next = $("[data-reviews-next]");
  if (!track || !dotsWrap) return;

  const slides = $all(".testimonial", track);
  if (!slides.length) return;

  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Go to review ${i + 1}`);
    b.addEventListener("click", () => {
      slides[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    });
    dotsWrap.appendChild(b);
    return b;
  });

  function getActiveIndex() {
    const left = track.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((s, i) => {
      const dist = Math.abs(s.offsetLeft - left);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    });
    return best;
  }

  function setActive(i) {
    dots.forEach((d, idx) => d.setAttribute("aria-current", idx === i ? "true" : "false"));
  }

  let raf = 0;
  track.addEventListener("scroll", () => {
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(() => setActive(getActiveIndex()));
  });

  setActive(0);

  function go(delta) {
    const i = getActiveIndex();
    const nextIndex = clamp(i + delta, 0, slides.length - 1);
    slides[nextIndex].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  if (prev) prev.addEventListener("click", () => go(-1));
  if (next) next.addEventListener("click", () => go(1));
}

function initBookingForm() {
  const form = $("[data-booking-form]");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const date = String(fd.get("date") || "").trim();
    const location = String(fd.get("location") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const lines = [
      "Mehendi Booking Request",
      "----------------------",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Event Date: ${date}`,
      `Event Location: ${location}`,
      message ? `Message: ${message}` : "",
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initAOS();
  initOnLoadReveal();
  initSmoothScroll();
  initMobileNav();
  initLightbox();
  initReviewsSlider();
  initBookingForm();
});

