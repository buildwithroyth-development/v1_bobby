/* Motion layer: runs after each page renders (wraps pageReady). */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var page = document.body.dataset.page || "";

  /* Split a heading into word spans, keeping inline children such as .em and <br> */
  function split(el) {
    if (el.classList.contains("split")) return;
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement("span"); w.className = "w";
            var s = document.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR" && !n.classList.contains("w")) walk(n);
      });
    })(el);
    el.classList.add("split");
  }

  function headlines() {
    document.querySelectorAll("main h1:not([data-nosplit])").forEach(function (h) {
      split(h);
      h.classList.remove("rise");
      h.removeAttribute("data-reveal");
      requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add("go"); }); });
    });
    /* Section headings already carry data-reveal: their words rise when it fires */
    document.querySelectorAll("main h2[data-reveal], main .h2[data-reveal]").forEach(split);
  }

  function ambience() {
    document.querySelectorAll(".page-hero, .tp-hero").forEach(function (h) {
      if (h.querySelector(".amb")) return;
      var a = document.createElement("div"); a.className = "amb"; a.setAttribute("aria-hidden", "true");
      a.innerHTML = "<i></i><i></i><i></i>";
      h.insertBefore(a, h.firstChild);
    });
    var home = document.querySelector(".hero h1");
    if (home && window.SMILE && !document.querySelector(".hero-smile")) {
      home.insertAdjacentHTML("afterend", SMILE("hero-smile"));
      var p = document.querySelector(".hero-smile path"); if (p) p.setAttribute("pathLength", "1");
    }
    document.querySelectorAll(".highlights li").forEach(function (li, i) { li.style.setProperty("--i", i); });
  }

  function marquee() {
    if (page !== "home" || !window.SITE || document.querySelector(".marquee")) return;
    var hero = document.querySelector(".hero"); if (!hero) return;
    var star = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 0c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10C5.2 9.4 9.4 5.2 10 0z"/></svg>';
    var row = function (hidden) {
      return '<div class="marquee-row"' + (hidden ? ' aria-hidden="true"' : "") + '>' + SITE.treatments.map(function (t) {
        return '<a href="treatment.html?id=' + t.id + '"' + (hidden ? ' tabindex="-1"' : "") + '>' + UI.esc(t.name) + star + '</a>';
      }).join("") + '</div>';
    };
    var m = document.createElement("section");
    m.className = "marquee"; m.setAttribute("aria-label", "Our treatments");
    m.innerHTML = '<div class="marquee-track">' + row(false) + row(true) + '</div>' +
      '<button class="marquee-pause" type="button" aria-label="Pause scrolling treatments" aria-pressed="false">' +
      '<svg viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M3 2h3v10H3zM8 2h3v10H8z"/></svg></button>';
    hero.after(m);
    var b = m.querySelector(".marquee-pause");
    b.addEventListener("click", function () {
      var on = m.classList.toggle("paused");
      b.setAttribute("aria-pressed", on);
      b.setAttribute("aria-label", on ? "Play scrolling treatments" : "Pause scrolling treatments");
      b.innerHTML = on ? '<svg viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M3 1.5l9 5.5-9 5.5z"/></svg>'
                       : '<svg viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M3 2h3v10H3zM8 2h3v10H8z"/></svg>';
    });
  }

  function spotlight() {
    if (!fine) return;
    document.querySelectorAll(".t, .wcard, .key, .loc, .tech-card, .related a, .review-slot, .result").forEach(function (c) {
      if (c.classList.contains("spot")) return;
      c.classList.add("spot");
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  function magnetic() {
    if (!fine || reduce) return;
    document.querySelectorAll("main .btn:not(.btn-sm), .cta-band .btn").forEach(function (b) {
      if (b.classList.contains("mag")) return;
      b.classList.add("mag");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        b.style.setProperty("--tx", (x * 6).toFixed(1) + "px");
        b.style.setProperty("--ty", (y * 4).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--tx", "0px"); b.style.setProperty("--ty", "0px"); });
    });
  }

  function icons() {
    document.querySelectorAll(".key-ic svg, .wcard .badge svg, .safety-line svg, .tech-card svg").forEach(function (svg) {
      if (svg.classList.contains("draw-ic")) return;
      if (svg.getAttribute("stroke") === null && !svg.querySelector("[stroke]") && getComputedStyle(svg).stroke === "none") return;
      svg.classList.add("draw-ic");
      svg.querySelectorAll("path, rect, circle, line, polyline, ellipse").forEach(function (s) { s.setAttribute("pathLength", "1"); });
    });
  }

  function smalls() {
    document.querySelectorAll(".wed .chip").forEach(function (c, i) { c.style.setProperty("--i", i); });
    document.querySelectorAll(".stars").forEach(function (s) {
      if (s.querySelector(".st")) return;
      s.innerHTML = s.textContent.trim().split("").map(function (ch, i) { return '<span class="st" style="--i:' + i + '">' + ch + '</span>'; }).join("");
    });
    /* The doctor page portrait sits in the hero: let it rise on load */
    document.querySelectorAll(".ptile.rise").forEach(function (p) { p.style.setProperty("--d", "120ms"); requestAnimationFrame(function () { requestAnimationFrame(function () { p.classList.add("in"); }); }); });
    /* Stagger doctor tiles a touch, for the rising cut-outs */
    document.querySelectorAll(".team-grid .dcard").forEach(function (d, i) { if (!d.style.getPropertyValue("--d")) d.style.setProperty("--d", (i % 3) * 90 + "ms"); });
  }

  /* Count numbers up once: <span data-count="30">30</span> */
  function counts() {
    var els = document.querySelectorAll("[data-count]");
    if (reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var el = e.target, to = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length, t0 = performance.now();
        (function tick(now) {
          var p = Math.min(1, (now - t0) / 1400), k = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * k).toFixed(dec);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Photos marked data-uncover reveal from the bottom when they arrive (any page) */
  function uncover() {
    var els = document.querySelectorAll("[data-uncover]:not(.in)");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Clinic tour video: plays muted only while on screen; a button pauses it; reduced motion waits for a tap */
  function tourVideo() {
    document.querySelectorAll(".tour").forEach(function (t) {
      var v = t.querySelector("video"), b = t.querySelector(".tour-toggle"); if (!v || !b || t.dataset.ready) return;
      t.dataset.ready = "1";
      var PLAY = '<svg viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M3 1.5l9 5.5-9 5.5z"/></svg>';
      var PAUSE = '<svg viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M3 2h3v10H3zM8 2h3v10H8z"/></svg>';
      var userPaused = reduce;   /* reduced motion: never starts on its own */
      var sync = function () { var on = !v.paused; b.innerHTML = on ? PAUSE : PLAY; b.setAttribute("aria-label", on ? "Pause video" : "Play video"); b.setAttribute("aria-pressed", on); };
      v.addEventListener("play", sync); v.addEventListener("pause", sync);
      b.addEventListener("click", function () { if (v.paused) { userPaused = false; v.play(); } else { userPaused = true; v.pause(); } });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) { es.forEach(function (e) {
          if (e.isIntersecting && !userPaused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else if (!e.isIntersecting) v.pause();
        }); }, { threshold: .35 }).observe(t);
      }
      sync();
    });
  }

  function run() { tourVideo(); uncover(); headlines(); ambience(); marquee(); icons(); smalls(); spotlight(); magnetic(); counts(); }

  /* Run before the page's own reveals start, so split headings and icons are ready */
  var orig = window.pageReady;
  window.pageReady = function () {
    run();
    if (orig) orig.apply(this, arguments);
    /* the marquee links and late-rendered cards get the hover layer too */
    spotlight(); magnetic();
  };
})();
