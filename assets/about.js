/* About page: renders the team list and the closing CTA, then runs the scroll story.
   Scenes need GSAP + ScrollTrigger; without them, or with reduced motion, every section is simply visible. */
(function () {
  var S = window.SITE, U = window.UI;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Team: names and designations from the doctor data ---------- */
  var people = document.getElementById("people");
  if (people) people.innerHTML = S.doctors.map(function (d, i) {
    return '<li style="--d:' + (i * 70) + 'ms"><a href="doctor.html?id=' + d.id + '"><span class="n">' + U.pad(i + 1) + '</span><b>' + U.esc(d.name) +
      '</b><span class="r">' + U.esc(d.role) + '</span><span class="go" aria-hidden="true">→</span></a></li>';
  }).join("");
  document.querySelectorAll(".ab-quals li").forEach(function (li, i) { li.style.setProperty("--d", i * 110 + "ms"); });

  var cta = document.getElementById("cta");
  if (cta) cta.outerHTML = U.cta();

  /* ---------- Rows that draw their rules in as they arrive (quals, team) ---------- */
  var rows = document.querySelectorAll(".ab-quals li, .ab-people li");
  if (reduce || !("IntersectionObserver" in window)) rows.forEach(function (r) { r.classList.add("in"); });
  else {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
    rows.forEach(function (r) { rio.observe(r); });
  }

  /* ---------- Page tone: cream and linen alternate as each section takes the middle of the screen ---------- */
  var main = document.querySelector(".about"), TONES = { cream: "#FFFDFB", linen: "#F8F3EF" };
  if (main && "IntersectionObserver" in window) {
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) main.style.setProperty("--tone", TONES[e.target.dataset.tone] || TONES.cream); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll("[data-tone]").forEach(function (s) { tio.observe(s); });
  }

  pageReady();

  /* ---------- Gallery count on phones (native swipe) ---------- */
  var track = document.querySelector(".ab-track"), count = document.querySelector(".ab-count b"), items = track ? track.children : [];
  function setCount(i) { if (count) count.textContent = U.pad(Math.max(1, Math.min(items.length, i))); }
  if (track) track.addEventListener("scroll", function () {
    var w = items[0] ? items[0].getBoundingClientRect().width + 16 : 1;
    setCount(Math.round(track.scrollLeft / w) + 1);
  }, { passive: true });

  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  /* 1 · Hero hands over: it settles back and fades while the philosophy rises over it */
  gsap.to(".ab-hero-in", { scale: .94, yPercent: -6, opacity: .2, ease: "none", transformOrigin: "50% 100%",
    scrollTrigger: { trigger: ".ab-hero", start: "top top", end: "bottom top", scrub: true, refreshPriority: 10 } });

  /* 2 · Philosophy: each word goes from faint to full as the sentence passes through the screen */
  var st = document.querySelector(".ab-statement");
  if (st) {
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement("span"); s.className = "sw"; s.textContent = w; f.appendChild(s);
          });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1) wrap(n);
      });
    })(st);
    var words = st.querySelectorAll(".sw");
    gsap.set(words, { opacity: .14 });
    gsap.to(words, { opacity: 1, ease: "none", stagger: .1,
      scrollTrigger: { trigger: st, start: "top 78%", end: "bottom 42%", scrub: .5, refreshPriority: 9 } });
  }

  /* 3 · Founder: the name rises line by line out of its mask */
  gsap.from(".ab-name .ln > span", { yPercent: 105, duration: 1.2, ease: "expo.out", stagger: .12,
    scrollTrigger: { trigger: ".ab-name", start: "top 82%", once: true, refreshPriority: 8 } });

  /* 4 · Approach: the five words glide sideways as the section passes */
  var glide = document.querySelector(".ab-glide-row");
  if (glide) gsap.fromTo(glide, { x: 0 }, { x: function () { return -(glide.scrollWidth - innerWidth * .9); }, ease: "none",
    scrollTrigger: { trigger: ".ab-glide", start: "top bottom", end: "bottom top", scrub: .6, invalidateOnRefresh: true, refreshPriority: 7 } });

  /* 5 · Gallery: on wide screens the section holds while the photographs slide past */
  var mm = gsap.matchMedia();
  mm.add("(min-width: 1024px) and (min-height: 640px)", function () {
    var sec = document.querySelector(".ab-gallery"); if (!sec || !track) return;
    sec.classList.add("is-pinned");
    var bar = sec.querySelector(".ab-progress i");
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth + 40); };
    var reveal = function () {
      Array.prototype.forEach.call(items, function (it, i) {
        var r = it.getBoundingClientRect();
        if (r.left < innerWidth * .92) it.classList.add("on");
        if (r.left < innerWidth * .5) setCount(i + 1);
      });
    };
    gsap.to(track, { x: function () { return -dist(); }, ease: "none",
      scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: .6,
        anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 6,
        onUpdate: function (self) { bar.style.transform = "scaleX(" + self.progress.toFixed(3) + ")"; reveal(); },
        onEnter: reveal, onRefresh: reveal } });
    reveal();
    return function () { sec.classList.remove("is-pinned"); gsap.set(track, { clearProps: "transform" }); Array.prototype.forEach.call(items, function (it) { it.classList.add("on"); }); };
  });

  ScrollTrigger.refresh();
  addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
