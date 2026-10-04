/* ==========================================================================
   Studio C Beauty — interações e animações
   Tudo que é essencial (links, menu, técnicas, FAQ, lightbox) funciona sem
   GSAP/Lenis; as animações são uma camada extra aplicada só se disponíveis.
   ========================================================================== */
(() => {
  "use strict";

  const WHATSAPP = "5515997333065";

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const animate = hasGSAP && !reduced;
  if (!hasGSAP) root.classList.add("no-gsap");

  /* ---------- WhatsApp links ---------- */
  $$(".wa-link").forEach((a) => {
    const msg = a.dataset.msg || "Olá, Cássia!";
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (animate) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.085 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }
  const lockScroll = (lock) => {
    if (lenis) lock ? lenis.stop() : lenis.start();
    else document.body.style.overflow = lock ? "hidden" : "";
  };
  const scrollToEl = (el) => {
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  /* ---------- Mobile menu ---------- */
  const burger = $(".burger");
  const menu = $("#menu");
  const setMenu = (open) => {
    root.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.setAttribute("aria-hidden", !open);
    lockScroll(open);
  };
  burger.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));

  /* ---------- Anchor links ---------- */
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = a.getAttribute("href").length > 1 && $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (root.classList.contains("menu-open")) setMenu(false);
      scrollToEl(target);
    })
  );

  /* ---------- Header + floating button ---------- */
  const header = $(".header");
  const waFloat = $(".wa-float");
  let lastY = 0;
  const onScroll = (y) => {
    header.classList.toggle("is-scrolled", y > 20);
    if (Math.abs(y - lastY) > 4) {
      header.classList.toggle("is-hidden", y > lastY && y > 400 && !root.classList.contains("menu-open"));
      lastY = y;
    }
    waFloat.classList.toggle("is-visible", y > window.innerHeight * 0.6);
  };
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
  onScroll(window.scrollY);

  // Active nav link
  const navLinks = $$(".nav a");
  const sectionObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
      }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Techniques ---------- */
  const techItems = $$(".tech");
  const stageImgs = $(".stage__imgs");
  const stageName = $(".stage__name");
  const shadesWrap = $(".stage__shades");
  const shadeBtns = $$(".shade", shadesWrap);
  let activeTech = null;
  let activeShade = null;
  let preferredShade = "preto";

  const showStageImage = (src, alt) => {
    const previous = $$("img", stageImgs);
    const img = new Image();
    img.decoding = "async";
    img.alt = alt;
    img.className = previous.length ? "is-entering" : "";
    img.src = src;
    stageImgs.append(img);
    if (!previous.length) return;
    const enter = () => requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove("is-entering")));
    img.complete ? enter() : img.addEventListener("load", enter, { once: true });
    const cleanup = () => previous.forEach((p) => p.remove());
    img.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, 2000);
  };

  const activateTech = (item, shade = preferredShade) => {
    const images = JSON.parse(item.dataset.images);
    if (!images[shade]) shade = "preto";
    if (item === activeTech && shade === activeShade) return;

    techItems.forEach((t) => {
      const on = t === item;
      t.classList.toggle("is-active", on);
      $(".tech__head", t).setAttribute("aria-expanded", on);
    });
    stageName.textContent = item.dataset.name;
    shadesWrap.classList.toggle("is-disabled", !images.marrom);
    shadeBtns.forEach((b) => {
      const on = b.dataset.shade === shade;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
      b.tabIndex = images.marrom ? 0 : -1;
    });
    showStageImage(images[shade], `${item.dataset.name} com fios ${shade === "marrom" ? "marrons" : "pretos"}`);
    activeTech = item;
    activeShade = shade;
  };

  techItems.forEach((item) => {
    $(".tech__head", item).addEventListener("click", () => activateTech(item));
    if (finePointer) {
      let timer;
      item.addEventListener("mouseenter", () => (timer = setTimeout(() => activateTech(item), 140)));
      item.addEventListener("mouseleave", () => clearTimeout(timer));
    }
  });
  shadeBtns.forEach((b) =>
    b.addEventListener("click", () => {
      preferredShade = b.dataset.shade;
      activateTech(activeTech, preferredShade);
    })
  );
  if (techItems.length) activateTech(techItems[0]);

  // Preload every technique photo so swaps are instant
  window.addEventListener("load", () =>
    techItems.forEach((t) => Object.values(JSON.parse(t.dataset.images)).forEach((src) => (new Image().src = src)))
  );

  /* ---------- FAQ ---------- */
  const qas = $$(".qa");
  qas.forEach((qa) =>
    $(".qa__q", qa).addEventListener("click", () => {
      const open = !qa.classList.contains("is-open");
      qas.forEach((o) => {
        o.classList.toggle("is-open", o === qa && open);
        $(".qa__q", o).setAttribute("aria-expanded", o === qa && open);
      });
      if (animate) setTimeout(() => ScrollTrigger.refresh(), 650);
    })
  );

  /* ---------- Price card glow ---------- */
  $$(".price").forEach((card) =>
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    })
  );

  /* ---------- Gallery: progress + lightbox ---------- */
  const viewport = $(".gallery__viewport");
  const progress = $(".gallery__progress span");
  const setProgress = (p) => progress.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(3));
  viewport.addEventListener("scroll", () => {
    if (root.classList.contains("is-hscroll")) return;
    setProgress(viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth || 1));
  }, { passive: true });

  const shots = $$(".shot");
  const lightbox = $(".lightbox");
  const lbImg = $(".lightbox__fig img", lightbox);
  const lbCap = $(".lightbox__fig figcaption", lightbox);
  let lbIndex = 0;
  let lastFocus = null;

  const showShot = (i) => {
    lbIndex = (i + shots.length) % shots.length;
    const img = $("img", shots[lbIndex]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = $("figcaption", shots[lbIndex]).textContent.replace(/^\d+/, "").trim();
  };
  const openLightbox = (i) => {
    lastFocus = document.activeElement;
    showShot(i);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    lockScroll(true);
    $(".lightbox__close", lightbox).focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lockScroll(false);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };

  shots.forEach((shot, i) => $(".shot__btn", shot).addEventListener("click", () => openLightbox(i)));
  $(".lightbox__close", lightbox).addEventListener("click", closeLightbox);
  $(".lightbox__nav--prev", lightbox).addEventListener("click", () => showShot(lbIndex - 1));
  $(".lightbox__nav--next", lightbox).addEventListener("click", () => showShot(lbIndex + 1));
  lightbox.addEventListener("click", (e) => e.target === lightbox && closeLightbox());

  let touchX = null;
  lightbox.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showShot(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("is-open")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showShot(lbIndex + 1);
      if (e.key === "ArrowLeft") showShot(lbIndex - 1);
    } else if (e.key === "Escape" && root.classList.contains("menu-open")) {
      setMenu(false);
    }
  });

  /* ======================================================================
     Animations (GSAP)
     ====================================================================== */
  const loader = $(".loader");
  if (!animate) {
    if (loader) loader.remove();
    return;
  }

  // Split text into masked words, keeping inline tags such as <em>
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(document.createTextNode(" "));
            const w = document.createElement("span");
            const inner = document.createElement("span");
            w.className = "w";
            inner.className = "w__i";
            inner.textContent = part;
            w.append(inner);
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
          walk(child);
        }
      });
    };
    walk(el);
    return $$(".w__i", el);
  };

  /* ---------- Custom cursor + magnetic buttons ---------- */
  if (finePointer) {
    root.classList.add("has-cursor");
    const cursor = $(".cursor");
    gsap.set(cursor, { opacity: 0 });
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("pointermove", (e) => {
      gsap.to(cursor, { opacity: 1, duration: 0.3, overwrite: "auto" });
      xTo(e.clientX);
      yTo(e.clientY);
    });
    document.addEventListener("pointerleave", () => gsap.to(cursor, { opacity: 0, duration: 0.3 }));
    document.addEventListener("pointerover", (e) => {
      const view = e.target.closest("[data-cursor]");
      cursor.classList.toggle("is-view", !!view);
      cursor.classList.toggle("is-hover", !view && !!e.target.closest("a, button"));
    });

    $$("[data-magnetic]").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const my = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.3);
        my((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener("pointerleave", () => { mx(0); my(0); });
    });
  }

  /* ---------- Intro: loader → hero ---------- */
  const heroWords = splitWords($(".hero__title"));
  gsap.set(heroWords, { yPercent: 118 });
  const badge = $(".hero__badge");

  const heroTl = gsap.timeline({ paused: true, defaults: { ease: "expo.out", duration: 1.4 } })
    .fromTo(".hero__frame",
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.7, ease: "expo.inOut", clearProps: "clipPath" })
    .from(".hero__frame img", { scale: 1.45, duration: 2.4 }, "<")
    .to(heroWords, { yPercent: 0, stagger: 0.07, duration: 1.4 }, 0.45)
    .from(".hero__eyebrow", { opacity: 0, x: -24 }, 0.6)
    .from([".hero__lead", ".hero__ctas", ".hero__meta"], { opacity: 0, y: 34, stagger: 0.12 }, 0.8)
    .from(".header__inner", { opacity: 0, y: -24, duration: 1.2 }, 0.7)
    .fromTo(".hero__inset",
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", clearProps: "clipPath" }, 0.9)
    .from(badge, {
      scale: 0, rotate: -120, duration: 1.4,
      onStart: () => (badge.style.transition = "none"),
      onComplete: () => gsap.set(badge, { clearProps: "transform,transition" }),
    }, 1.2)
    .from(".hero__scroll", { opacity: 0, y: 20 }, 1.4);

  const waitFor = (promise, ms) => Promise.race([promise, new Promise((r) => setTimeout(r, ms))]);
  const heroImg = $(".hero__frame img");
  const heroReady = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(),
  ]);

  if (loader) {
    loader.style.animation = "none"; // JS is in control; drop the CSS failsafe
    lockScroll(true);
    const count = $(".loader__count span", loader);
    const counter = { v: 0 };
    const loaderTl = gsap.timeline()
      .to(".loader__mark path", { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.07 })
      .from(".loader__brand", { opacity: 0, y: 24, duration: 1, ease: "expo.out" }, 0.3)
      .to(counter, { v: 100, duration: 1.7, ease: "power2.inOut", onUpdate: () => (count.textContent = Math.round(counter.v)) }, 0);

    Promise.all([waitFor(heroReady, 3500), loaderTl.then()]).then(() => {
      gsap.timeline({
        onComplete: () => { loader.remove(); lockScroll(false); ScrollTrigger.refresh(); },
      })
        .to(".loader__inner, .loader__count", { opacity: 0, y: -30, duration: 0.6, ease: "power2.in" })
        .to(loader, { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, 0.35)
        .add(() => heroTl.play(), 0.75);
    });
  } else {
    heroTl.play();
  }

  /* ---------- Hero scroll ---------- */
  const heroScroll = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero__content", { yPercent: -14, opacity: 0.25, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__media", { y: 90, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__inset", { yPercent: -12, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__letter", { yPercent: 18, rotate: 8, ease: "none", scrollTrigger: heroScroll });

  /* ---------- Marquee with scroll velocity ---------- */
  const marquee = gsap.to(".marquee__track", { xPercent: -50, ease: "none", duration: 32, repeat: -1 });
  marquee.totalTime(marquee.duration() * 50); // headroom so it can play in reverse
  let marqueeDir = 1;
  ScrollTrigger.create({
    onUpdate(self) {
      marqueeDir = self.direction;
      const boost = Math.min(Math.abs(self.getVelocity()) / 250, 6);
      gsap.to(marquee, {
        timeScale: marqueeDir * (1 + boost), duration: 0.25, overwrite: true,
        onComplete: () => gsap.to(marquee, { timeScale: marqueeDir, duration: 1.2, overwrite: true }),
      });
    },
  });

  /* ---------- Split headings ---------- */
  $$("[data-split]").forEach((el) => {
    if (el.classList.contains("hero__title")) return;
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 118, duration: 1.3, ease: "expo.out", stagger: 0.06,
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
  });

  /* ---------- Fade-ups ---------- */
  gsap.set("[data-fade]", { opacity: 0, y: 44 });
  ScrollTrigger.batch("[data-fade]", {
    start: "top 90%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, overwrite: true }),
  });

  gsap.from(".tech", {
    opacity: 0, y: 40, duration: 1.1, ease: "expo.out", stagger: 0.08,
    scrollTrigger: { trigger: ".techs__list", start: "top 82%", once: true },
  });

  /* ---------- Image reveals + parallax ---------- */
  $$("[data-reveal-img]").forEach((el) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 84%", once: true } });
    tl.fromTo(el,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", clearProps: "clipPath" });
    const img = $(":scope > img", el);
    if (img) tl.from(img, { scale: 1.3, duration: 2.2, ease: "expo.out" }, 0);
  });

  $$("[data-parallax]").forEach((img) => {
    const amount = parseFloat(img.dataset.parallax) || 12;
    gsap.fromTo(img, { yPercent: 0 }, {
      yPercent: -amount, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ---------- Price counters ---------- */
  $$("[data-count]").forEach((el) => {
    const end = parseInt(el.dataset.count, 10);
    const obj = { v: 0 };
    el.textContent = "0";
    gsap.to(obj, {
      v: end, duration: 2, ease: "power3.out",
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ---------- Process line ---------- */
  gsap.to(".process__line span", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: ".process__steps", start: "top 78%", end: "bottom 60%", scrub: true },
  });

  /* ---------- Gallery: pinned horizontal scroll on desktop ---------- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    root.classList.add("is-hscroll");
    const track = $(".gallery__track");
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: ".gallery", start: "top top", end: () => `+=${distance()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(self.progress),
      },
    });
    return () => { root.classList.remove("is-hscroll"); setProgress(0); };
  });

  /* ---------- Footer ---------- */
  gsap.from(".footer__big", {
    yPercent: 60, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".footer", start: "top 85%", end: "bottom bottom", scrub: true },
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
