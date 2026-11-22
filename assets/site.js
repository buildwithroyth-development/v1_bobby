/* Shared chrome + interactions for every page. */
(function () {
  var S = window.SITE;
  var page = document.body.dataset.page || "";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  var MARK = '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#572E54"/><path d="M14 9c-3.3 0-5.5 2.5-5.5 6 0 3.3 1.4 5.2 1.9 9 .7 4.1 1.4 8.2 3.6 8.2 2 0 1.8-6.8 4.1-6.8h3.8c2.3 0 2.1 6.8 4.1 6.8 2.2 0 2.9-4.1 3.6-8.2.5-3.8 1.9-5.7 1.9-9 0-3.5-2.2-6-5.5-6-1.9 0-2.9 1.1-5.5 1.1S15.9 9 14 9z" fill="#FFFDFB"/><path d="M27.5 5.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#CEB2BD"/></svg>';
  /* Favicon: the sparkle tooth */
  (function () {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="12" fill="#572E54"/><path d="M14 9c-3.3 0-5.5 2.5-5.5 6 0 3.3 1.4 5.2 1.9 9 .7 4.1 1.4 8.2 3.6 8.2 2 0 1.8-6.8 4.1-6.8h3.8c2.3 0 2.1 6.8 4.1 6.8 2.2 0 2.9-4.1 3.6-8.2.5-3.8 1.9-5.7 1.9-9 0-3.5-2.2-6-5.5-6-1.9 0-2.9 1.1-5.5 1.1S15.9 9 14 9z" fill="#FFFDFB"/><path d="M27.5 5.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#CEB2BD"/></svg>';
    var l = document.createElement("link"); l.rel = "icon"; l.type = "image/svg+xml"; l.href = "data:image/svg+xml," + encodeURIComponent(svg);
    document.head.appendChild(l);
  })();
  var CHEV = '<svg class="chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ARROW = '<span class="arrow" aria-hidden="true">→</span>';
  window.SMILE = function (cls) { return '<svg class="smile ' + (cls || "") + '" viewBox="0 0 400 60" aria-hidden="true" preserveAspectRatio="none"><path d="M4 8 C 90 62, 310 62, 396 8"/></svg>'; };

  var PHONE = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>';
  var thumb = function (id) { return '<span class="th" aria-hidden="true" style="background-image:url(assets/img/treat-' + id + '.jpg)"></span>'; };
  var cur = function (p) { return page === p ? ' aria-current="page"' : ""; };

  var tLinks = S.treatments.map(function (t) {
    return '<a href="treatment.html?id=' + t.id + '">' + thumb(t.id) + '<span class="tx"><b>' + esc(t.name) + '</b><small>' + esc(t.short) + '</small></span></a>';
  }).join("");

  /* ---------- Header: floating pill ---------- */
  var header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML =
    '<div class="wrap"><div class="bar">' +
      '<a class="brand" href="index.html" aria-label="' + esc(S.name) + ', home">' + MARK + '<span><b>Dr. Bobby Thomas</b><small>Dental &amp; Implant Centre</small></span></a>' +
      '<nav class="nav" aria-label="Main"><span class="nav-ind" aria-hidden="true"></span>' +
        '<a href="index.html"' + cur("home") + '>Home</a>' +
        '<div class="dd"><button type="button" aria-expanded="false" aria-controls="dd-treat"' + (page === "treatment" || page === "treatments" ? ' aria-current="page"' : "") + '>Treatments ' + CHEV + '</button>' +
          '<div class="dd-panel" id="dd-treat">' +
            '<div class="dd-head"><a href="treatments.html">All treatments</a><small>' + S.treatments.length + ' areas of care</small></div>' +
            '<div class="dd-list">' + tLinks + '</div>' +
            '<a class="dd-feature" href="contact.html"><span class="ph" data-img="about-2" data-alt=""></span><b>Not sure what you need?</b><small>Book a consultation and we will explain your options.</small><span class="go">Book a consultation ' + ARROW + '</span></a>' +
          '</div></div>' +
        '<a href="about.html"' + (page === "about" || page === "doctor" || page === "doctors" ? ' aria-current="page"' : "") + '>About Us</a>' +
        '<a href="careers.html"' + cur("careers") + '>Careers</a>' +
        '<a href="contact.html"' + (page === "contact" || page === "clinic" || page === "clinics" ? ' aria-current="page"' : "") + '>Contact</a>' +
      '</nav>' +
      '<div class="header-actions">' +
        '<a class="icon-btn call" href="' + S.phoneHref + '" aria-label="Call ' + esc(S.phone) + '" data-tip="' + esc(S.phone) + '">' + PHONE + '</a>' +
        '<a class="btn btn-sm book" href="contact.html">Book appointment</a>' +
        '<button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><i></i></button>' +
      '</div>' +
    '</div></div>';
  document.body.insertBefore(header, document.body.firstChild);

  /* Sliding hover highlight. First hover appears in place; later hovers slide between links. */
  var nav = header.querySelector(".nav"), ind = nav.querySelector(".nav-ind");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var place = function (el) {
      var r = el.getBoundingClientRect(), n = nav.getBoundingClientRect();
      ind.style.width = r.width + "px";
      ind.style.transform = "translateX(" + (r.left - n.left) + "px)";
    };
    nav.querySelectorAll(":scope > a, :scope > .dd > button").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (!ind.classList.contains("on")) { ind.classList.add("instant"); place(el); ind.offsetWidth; ind.classList.remove("instant"); }
        else place(el);
        ind.classList.add("on");
      });
    });
    nav.addEventListener("mouseleave", function () { ind.classList.remove("on"); });
  }

  var skip = document.createElement("a");
  skip.className = "skip"; skip.href = "#main"; skip.textContent = "Skip to content";
  document.body.insertBefore(skip, document.body.firstChild);

  var prog = document.createElement("div");
  prog.className = "progress"; prog.setAttribute("aria-hidden", "true");
  document.body.appendChild(prog);

  /* ---------- Drawer (mobile) ---------- */
  var scrim = document.createElement("div"); scrim.className = "drawer-scrim";
  var drawer = document.createElement("div");
  drawer.className = "drawer"; drawer.id = "drawer";
  drawer.setAttribute("role", "dialog"); drawer.setAttribute("aria-modal", "true"); drawer.setAttribute("aria-label", "Menu");
  drawer.innerHTML =
    '<div class="drawer-top"><a class="brand" href="index.html">' + MARK + '<span><b>Dr. Bobby Thomas</b><small>Dental &amp; Implant Centre</small></span></a>' +
    '<button class="menu-btn" type="button" aria-label="Close menu" data-close>✕</button></div>' +
    '<nav aria-label="Mobile">' +
      '<a href="index.html">Home</a>' +
      '<details><summary>Treatments ' + CHEV + '</summary><div class="m-treat">' + S.treatments.map(function (t) { return '<a href="treatment.html?id=' + t.id + '">' + thumb(t.id) + '<span>' + esc(t.name) + '</span></a>'; }).join("") + '</div></details>' +
      '<a href="about.html">About Us</a><a href="careers.html">Careers</a><a href="contact.html">Contact</a>' +
    '</nav>' +
    '<div class="m-more"><a href="treatments.html">All treatments</a><a href="doctors.html">Our doctors</a><a href="clinics.html">Clinics</a><a href="gallery.html">Smile gallery</a><a href="tourism.html">Visiting Bengaluru</a><a href="careers.html">Careers</a></div>' +
    '<div class="drawer-cta"><a class="btn" href="contact.html">Book a consultation ' + ARROW + '</a>' +
    '<a class="btn btn-ghost" href="' + S.phoneHref + '">' + PHONE + ' ' + esc(S.phone) + '</a></div>';
  document.body.appendChild(scrim); document.body.appendChild(drawer);
  var menuBtn = header.querySelector(".menu-btn");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    if (open) drawer.querySelector("[data-close]").focus(); else menuBtn.focus({ preventScroll: true });
  }
  menuBtn.addEventListener("click", function () { setMenu(true); });
  scrim.addEventListener("click", function () { setMenu(false); });
  drawer.querySelector("[data-close]").addEventListener("click", function () { setMenu(false); });
  drawer.addEventListener("click", function (e) { if (e.target.closest("a")) document.body.classList.remove("menu-open"); });

  /* ---------- Treatments dropdown ---------- */
  var dd = header.querySelector(".dd"), ddBtn = dd.querySelector("button"), ddTimer;
  function setDD(open) { if (open) dd.setAttribute("data-open", ""); else dd.removeAttribute("data-open"); ddBtn.setAttribute("aria-expanded", open); }
  ddBtn.addEventListener("click", function () { setDD(!dd.hasAttribute("data-open")); });
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    dd.addEventListener("mouseenter", function () { clearTimeout(ddTimer); setDD(true); });
    dd.addEventListener("mouseleave", function () { ddTimer = setTimeout(function () { setDD(false); }, 140); });
  }
  dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) setDD(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (dd.hasAttribute("data-open")) { setDD(false); ddBtn.focus(); }
    if (document.body.classList.contains("menu-open")) setMenu(false);
  });
  document.addEventListener("click", function (e) { if (!dd.contains(e.target)) setDD(false); });

  /* ---------- Footer ---------- */
  var footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML =
    '<div class="wrap"><div class="foot-grid">' +
      '<div><a class="brand" href="index.html">' + MARK + '<span><b>Dr. Bobby Thomas</b><small>Dental &amp; Implant Centre</small></span></a>' +
      '<p style="margin-top:.7rem;color:var(--muted);max-width:32ch;font-size:.88rem">30+ years of advanced dentistry in Bengaluru.</p></div>' +
      '<div><h4>Treatments</h4><ul>' + S.treatments.slice(0, 5).map(function (t) { return '<li><a href="treatment.html?id=' + t.id + '">' + esc(t.name) + '</a></li>'; }).join("") + '<li><a href="treatments.html">All treatments</a></li></ul></div>' +
      '<div><h4>Clinic</h4><ul><li><a href="about.html">About us</a></li><li><a href="doctors.html">Our doctors</a></li><li><a href="clinics.html">Clinic locations</a></li><li><a href="gallery.html">Smile gallery</a></li><li><a href="tourism.html">Visiting Bengaluru</a></li><li><a href="careers.html">Careers</a></li><li><a href="contact.html">Contact</a></li></ul></div>' +
      '<div><h4>Visit</h4>' + S.clinics.map(function (c) { return '<address style="margin-bottom:.6rem"><a href="clinic.html?id=' + c.id + '"><b>' + esc(c.name) + '</b></a><br>' + esc(c.address) + '</address>'; }).join("") +
      '<a href="' + S.phoneHref + '"><b>' + esc(S.phone) + '</b></a></div>' +
    '</div>' +
    '<div class="foot-legal"><span>© ' + new Date().getFullYear() + ' ' + esc(S.name) + '</span></div></div>';
  document.body.appendChild(footer);

  /* ---------- Floating mobile CTA ---------- */
  if (page !== "contact") {
    var fc = document.createElement("div");
    fc.className = "float-cta";
    fc.innerHTML = '<a class="btn" href="contact.html">Book a consultation</a><a class="btn btn-ghost" href="' + S.phoneHref + '" aria-label="Call the clinic">Call</a>';
    document.body.appendChild(fc);
  }

  /* ---------- Scroll-linked chrome (one rAF loop) ---------- */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("scrolled", y > 24);
    if (!reduce) prog.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (fc) fc.classList.toggle("show", y > innerHeight * 0.7 && y < max - 500);
    ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Shared render helpers ---------- */
  window.UI = {
    /* Free-standing doctor cut-out. Name and details appear on hover / focus (always visible on touch). */
    figure: function (d, o) {
      o = o || {};
      var ini = d.name.replace("Dr. ", "").split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2);
      var img = d.photo
        ? '<span class="fig-img"><img src="' + esc(d.photo) + '" alt="' + esc(d.name + ", " + d.role) + '" loading="lazy" decoding="async"></span>'
        : '<span class="fig-img"><span class="fig-mono" role="img" aria-label="' + esc(d.name + ", " + d.role) + '">' + esc(ini) + '</span></span>';
      if (o.big) return '<div class="fig-big">' + img + '</div>';
      return '<a class="dcard fig" data-reveal href="doctor.html?id=' + d.id + '">' + img +
        '<span class="fig-info"><b>' + esc(d.name) + '</b></span></a>';
    },
    esc: esc, pad: pad, ARROW: ARROW,
    faq: function (list) {
      return '<div class="faq">' + list.map(function (f) {
        return '<details><summary>' + esc(f[0]) + '<span class="pm" aria-hidden="true"></span></summary><div class="ans"><div class="ans-in">' + esc(f[1]) + '</div></div></details>';
      }).join("") + '</div>';
    },
    steps: function (items) {
      return '<ol class="steps-list" data-steps><span class="rail" aria-hidden="true"></span>' + items.map(function (s) {
        return '<li data-reveal><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p></li>';
      }).join("") + '</ol>';
    },
    cta: function (h, p) {
      return '<section class="cta-band"><div class="wrap">' +
        '<span class="eyebrow" data-reveal>Your next step starts here</span>' +
        '<h2 data-reveal>' + (h || "Let's Talk About Your Smile.") + '</h2>' + SMILE("draw") +
        '<p class="lead" data-reveal>' + esc(p || "Take the first step towards better oral health with a personalised dental consultation at Dr. Bobby Thomas Dental & Implant Centre, Bengaluru.") + '</p>' +
        '<div class="actions" data-reveal><a class="btn" href="contact.html">Book a consultation ' + ARROW + '</a><a class="btn btn-ghost" href="' + S.whatsapp + '" target="_blank" rel="noopener">Message on WhatsApp</a></div>' +
      '</div></section>';
    }
  };

  /* ---------- Reveals (IntersectionObserver; GSAP is only used on the homepage) ---------- */
  window.initReveals = function (root) {
    root = root || document;
    var els = root.querySelectorAll("[data-reveal]:not(.in), [data-mask]:not(.in)");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // Non-uniform stagger for siblings revealed together
        var sibs = Array.prototype.filter.call(e.target.parentNode.children, function (c) { return c.hasAttribute("data-reveal"); });
        var i = sibs.indexOf(e.target);
        if (i > 0) e.target.style.setProperty("--d", Math.round(Math.min(i, 6) * 70 * (1 - i * 0.04)) + "ms");
        e.target.classList.add("in"); io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    /* Masked photos start fully clipped, so they never reach a visible ratio:
       trigger them as soon as their box touches the viewport instead. */
    var mio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); mio.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    els.forEach(function (el) { (el.hasAttribute("data-mask") ? mio : io).observe(el); });
  };

  /* Smile arcs and step rails draw with scroll position (transform / dashoffset only) */
  window.initDraw = function () {
    var arcs = document.querySelectorAll(".smile.draw path");
    var rails = document.querySelectorAll("[data-steps]");
    if (reduce) return;
    arcs.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p._L = L; });
    function tick() {
      var vh = innerHeight;
      arcs.forEach(function (p) {
        var r = p.ownerSVGElement.getBoundingClientRect();
        var t = Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.45)));
        p.style.strokeDashoffset = p._L * (1 - t);
      });
      rails.forEach(function (ol) {
        var r = ol.getBoundingClientRect();
        var t = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
        var rail = ol._rail || (ol._rail = ol.querySelector(".rail"));
        rail.style.transform = "scaleY(" + t.toFixed(3) + ")";
      });
    }
    var q = false;
    addEventListener("scroll", function () { if (!q) { q = true; requestAnimationFrame(function () { tick(); q = false; }); } }, { passive: true });
    addEventListener("resize", tick);
    tick();
  };

  /* Image slots: <div class="ph" data-img="hero"> tries assets/img/hero.jpg, .jpeg, .webp, .png.
     If none exists the warm placeholder stays, so the layout never breaks. */
  window.initImages = function (root) {
    (root || document).querySelectorAll(".ph[data-img]:not([data-img-done])").forEach(function (ph) {
      ph.setAttribute("data-img-done", "");
      var exts = ["jpg", "jpeg", "webp", "png"], i = 0;
      (function next() {
        if (i >= exts.length) return;
        var img = new Image();
        img.alt = ph.getAttribute("data-alt") || "";
        img.onload = function () { ph.appendChild(img); ph.classList.add("has-img"); };
        img.onerror = next;
        img.src = "assets/img/" + ph.getAttribute("data-img") + "." + exts[i++];
      })();
    });
  };

  /* FAQ: smooth, interruptible open/close (height + opacity via WAAPI).
     Opening 260ms ease-out; closing is quicker (200ms). Reduced motion keeps native behaviour. */
  document.addEventListener("click", function (e) {
    var sum = e.target.closest(".faq summary");
    if (!sum || reduce) return;
    var d = sum.parentNode, ans = d.querySelector(".ans");
    if (!ans || !ans.animate) return;
    e.preventDefault();
    var closing = d.classList.contains("closing");
    var opening = !d.open || closing;
    var from = d.open ? ans.getBoundingClientRect().height : 0;
    if (d._anim) { d._anim.cancel(); d._anim = null; }
    var ease = "cubic-bezier(0.23, 1, 0.32, 1)";
    if (opening) {
      d.classList.remove("closing");
      d.open = true;
      var to = ans.getBoundingClientRect().height;
      d._anim = ans.animate([{ height: from + "px", opacity: from ? 1 : 0 }, { height: to + "px", opacity: 1 }], { duration: 260, easing: ease });
    } else {
      d.classList.add("closing");
      d._anim = ans.animate([{ height: from + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 200, easing: ease, fill: "forwards" });
      d._anim.onfinish = function () { d.open = false; d.classList.remove("closing"); if (d._anim) d._anim.cancel(); d._anim = null; };
    }
  });

  /* Pages call this after rendering their content */
  window.pageReady = function () { initImages(); initReveals(); initDraw(); };
})();
