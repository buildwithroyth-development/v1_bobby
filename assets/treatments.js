/* Treatments listing: builds the index from SITE.treatments, keeps the row nearest the middle of the
   screen "active" (its photo wipes in on the sticky panel), and hands the hero over on scroll. */
(function () {
  var S = window.SITE, U = window.UI;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var list = document.getElementById("trList"), shots = document.querySelector(".tr-shots");
  var num = document.querySelector(".tr-num b"), total = document.querySelector(".tr-num span"), bar = document.querySelector(".tr-bar i");
  var T = S.treatments, n = T.length;
  if (total) total.textContent = "/ " + U.pad(n);

  var ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  list.innerHTML = T.map(function (t, i) {
    return '<li class="tr-row" data-i="' + i + '"><a href="treatment.html?id=' + t.id + '">' +
      '<span class="n">' + U.pad(i + 1) + '</span><h2>' + U.esc(t.name) + '</h2>' +
      '<span class="go">' + ARROW + '</span>' +
      '<span class="thumb" aria-hidden="true"><img src="assets/img/treat-' + t.id + '.jpg" alt="" loading="lazy" decoding="async"></span>' +
      '<p>' + U.esc(t.short) + '</p></a></li>';
  }).join("");
  if (shots) shots.innerHTML = T.map(function (t, i) {
    return '<div class="tr-shot' + (i ? "" : " on") + '"><img src="assets/img/treat-' + t.id + '.jpg" alt="" ' + (i < 2 ? "" : 'loading="lazy" ') + 'decoding="async"></div>';
  }).join("");

  var rows = Array.prototype.slice.call(list.children), pics = shots ? Array.prototype.slice.call(shots.children) : [];
  var current = 0, hover = -1;

  function setActive(i) {
    if (i === current && list.classList.contains("has-active")) return;
    list.classList.add("has-active");
    rows.forEach(function (r, k) { r.classList.toggle("active", k === i); });
    pics.forEach(function (p, k) { p.classList.toggle("was", k === current && k !== i); p.classList.toggle("on", k === i); });
    current = i;
    if (num) num.textContent = U.pad(i + 1);
    if (bar) bar.style.transform = "scaleX(" + ((i + 1) / n).toFixed(3) + ")";
  }

  /* Scroll: the row whose middle is nearest the middle of the screen */
  var queued = false;
  function pick() {
    queued = false;
    if (hover > -1) return;
    var mid = innerHeight / 2, best = -1, dist = Infinity;
    rows.forEach(function (r, k) {
      var b = r.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) return;
      var d = Math.abs(b.top + b.height / 2 - mid); if (d < dist) { dist = d; best = k; }
    });
    if (best > -1) setActive(best);
  }
  addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(pick); } }, { passive: true });
  addEventListener("resize", pick);

  /* Hover and keyboard focus make a row active too */
  rows.forEach(function (r, k) {
    var a = r.querySelector("a");
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      r.addEventListener("mouseenter", function () { hover = k; setActive(k); });
      r.addEventListener("mouseleave", function () { hover = -1; pick(); });
    }
    a.addEventListener("focus", function () { setActive(k); });
  });

  /* Rows rise and draw their rules as they arrive */
  if (reduce || !("IntersectionObserver" in window)) rows.forEach(function (r) { r.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    rows.forEach(function (r) { io.observe(r); });
  }

  var cta = document.getElementById("cta");
  if (cta) cta.outerHTML = U.cta();
  pageReady();
  pick();

  /* Hero hands over: it settles back and fades as the index rises over it */
  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(".tr-hero-in", { scale: .95, yPercent: -6, opacity: .2, ease: "none", transformOrigin: "50% 100%",
    scrollTrigger: { trigger: ".tr-hero", start: "top top", end: "bottom top", scrub: true } });
})();
