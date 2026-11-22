/* Homepage scroll story, built on the content document's own sections.
   Needs GSAP + ScrollTrigger; without them (or with reduced motion) every section stays a normal, fully visible section. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;

  /* ---------- Intro curtain: first visit in a session only ---------- */
  (function () {
    if (reduce) return;
    var seen = false;
    try { seen = sessionStorage.getItem("bt-intro") === "1"; sessionStorage.setItem("bt-intro", "1"); } catch (e) {}
    if (seen) return;
    root.classList.add("has-intro");
    var c = document.createElement("div");
    c.className = "curtain"; c.setAttribute("aria-hidden", "true");
    c.innerHTML = '<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="12" fill="#572E54"/><path d="M14 9c-3.3 0-5.5 2.5-5.5 6 0 3.3 1.4 5.2 1.9 9 .7 4.1 1.4 8.2 3.6 8.2 2 0 1.8-6.8 4.1-6.8h3.8c2.3 0 2.1 6.8 4.1 6.8 2.2 0 2.9-4.1 3.6-8.2.5-3.8 1.9-5.7 1.9-9 0-3.5-2.2-6-5.5-6-1.9 0-2.9 1.1-5.5 1.1S15.9 9 14 9z" fill="#FFFDFB"/><path d="M27.5 5.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#CEB2BD"/></svg>';
    document.body.appendChild(c);
    c.addEventListener("animationend", function (e) { if (e.animationName === "curtain-up") c.remove(); });
    setTimeout(function () { if (c.parentNode) c.remove(); }, 2500);   /* never stays, even if animations are off */
  })();

  /* ---------- Desktop cursor ring ---------- */
  (function () {
    if (!fine || reduce) return;
    var cur = document.createElement("div");
    cur.className = "cursor"; cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = "<i></i><b>View</b>";
    document.body.appendChild(cur);
    var x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, running = false;
    function loop() {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;           /* eased follow, so it trails like a spring */
      cur.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      if (Math.abs(tx - x) > .1 || Math.abs(ty - y) > .1) requestAnimationFrame(loop); else running = false;
    }
    addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX; ty = e.clientY; cur.classList.add("on");
      var t = e.target.closest ? e.target : null;
      var view = t && t.closest(".t, .marquee a");
      var link = !view && t && t.closest("a, button, summary, [role=button]");
      cur.classList.toggle("view", !!view); cur.classList.toggle("link", !!link);
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener("pointerleave", function () { cur.classList.remove("on"); });
    addEventListener("pointerdown", function () { cur.classList.add("down"); });
    addEventListener("pointerup", function () { cur.classList.remove("down"); });
  })();

  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  var start = function () {
    var mm = gsap.matchMedia();

    /* ---------- Hero story: one pinned screen, two beats ----------
       The photograph pushes in while a cream gradient rises behind the words; the headline gives way to the
       30+ years and the first paragraph, with both paragraphs and the highlights. The buttons and clinics stay. */
    var hero = document.querySelector(".hero.story");
    if (hero) mm.add("(min-width: 800px) and (min-height: 600px)", function () {
      hero.classList.add("is-story");
      var stick = hero.querySelector(".hs-stick"), beats = gsap.utils.toArray(".hs-beat"), num = document.getElementById("hsN");
      var rail = hero.querySelector(".hs-rail"), ticks = rail.querySelectorAll("li"), fill = rail.querySelector(".bar i");
      var pic = hero.querySelector(".hs-photo img");
      gsap.set(beats.slice(1), { autoAlpha: 0, y: 46, filter: "blur(10px)" });
      var tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        trigger: hero, start: "top top", end: "+=200%", pin: stick, scrub: .6, anticipatePin: 1, refreshPriority: 11,
        onUpdate: function (self) {
          var p = self.progress * 2;
          var c = Math.max(0, Math.min(1, (p - .7) / .6));
          if (num) num.textContent = Math.round(30 * (1 - Math.pow(1 - c, 3)));
          var b = p < .6 ? 0 : 1;
          ticks[0].classList.toggle("on", b === 0); ticks[2].classList.toggle("on", b === 1);
          fill.style.transform = "scaleY(" + self.progress.toFixed(3) + ")";
        } } });
      tl.to(pic, { scale: 1.05, duration: 2 }, 0)
        .to(".hs-g-wash", { opacity: 1, duration: 1.2 }, .3)
        .to(".hs-g-warm", { opacity: .6, duration: 2 }, 0)
        .to(beats[0], { autoAlpha: 0, y: -50, filter: "blur(10px)", duration: .35, ease: "power2.in" }, .5)
        .to(beats[1], { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .45, ease: "power2.out" }, .65);
      return function () {
        hero.classList.remove("is-story");
        gsap.set(beats.concat([pic, ".hs-g-wash", ".hs-g-warm"]), { clearProps: "all" });
      };
    });

    /* ---------- About: the opening paragraph fills in word by word with the scroll ---------- */
    var lead = document.querySelector("#about .copy .lead");
    if (lead) {
      lead.removeAttribute("data-reveal"); lead.classList.add("fill-text", "in");
      lead.innerHTML = lead.innerHTML.replace(/(^|>)([^<]+)(?=<|$)/g, function (m, a, txt) {
        return a + txt.replace(/(\S+)/g, '<span class="sw">$1</span>');
      });
      var words = lead.querySelectorAll(".sw");
      gsap.set(words, { opacity: .16 });
      gsap.to(words, { opacity: 1, ease: "none", stagger: .1,
        scrollTrigger: { trigger: lead, start: "top 82%", end: "bottom 48%", scrub: .5, refreshPriority: 9 } });
    }

    /* ---------- Pre-wedding: the card grows from inset to full width ---------- */
    var wed = document.querySelector(".wed");
    if (wed) {
      wed.removeAttribute("data-reveal"); wed.classList.add("grow");
      gsap.fromTo(wed, { scale: .9, borderRadius: 48 }, { scale: 1, borderRadius: 24, ease: "none",
        scrollTrigger: { trigger: wed, start: "top bottom", end: "top 30%", scrub: .4, refreshPriority: 8,
          onEnter: function () { wed.classList.add("in"); } } });
    }

    /* ---------- Gallery: each photograph settles out of a slight zoom inside its frame ---------- */
    (function bindGallery(tries) {
      var imgs = document.querySelectorAll("#gallery .result .ph > img");
      if (imgs.length < document.querySelectorAll("#gallery .result .ph").length && tries < 20) return setTimeout(function () { bindGallery(tries + 1); }, 250);
      imgs.forEach(function (img) {
        gsap.fromTo(img, { scale: 1.22 }, { scale: 1, ease: "none",
          scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom 35%", scrub: true, refreshPriority: 5 } });
      });
      ScrollTrigger.refresh();
    })(0);

    /* ---------- Locations: each clinic photograph drifts inside its card ---------- */
    (function bindLocs(tries) {
      var imgs = document.querySelectorAll("#locs .loc .ph > img"), frames = document.querySelectorAll("#locs .loc .ph");
      if (imgs.length < frames.length && tries < 20) return setTimeout(function () { bindLocs(tries + 1); }, 250);
      imgs.forEach(function (img) {
        gsap.fromTo(img, { yPercent: -7, scale: 1.18 }, { yPercent: 7, ease: "none",
          scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true, refreshPriority: 3 } });
      });
      ScrollTrigger.refresh();
    })(0);

    /* ---------- Closing section: opens out from an inset rounded panel to full width ---------- */
    var fin = document.querySelector(".final");
    if (fin) {
      fin.classList.add("open");
      gsap.fromTo(fin, { clipPath: "inset(0% 4% 0% 4% round 40px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
        scrollTrigger: { trigger: fin, start: "top bottom", end: "top 20%", scrub: .4, refreshPriority: 4 } });
    }

    /* ---------- Wide screens: two pinned scenes ---------- */
    mm.add("(min-width: 1024px) and (min-height: 640px)", function () {
      var undo = [];

      /* Treatments slide sideways while the section holds still */
      var tr = document.getElementById("treatments"), track = document.getElementById("tGrid");
      if (tr && track) {
        tr.classList.add("hscroll");
        var bar = document.createElement("div"); bar.className = "h-progress"; bar.setAttribute("aria-hidden", "true"); bar.innerHTML = "<i></i>";
        track.after(bar);
        var dist = function () { return Math.max(0, track.scrollWidth - track.parentNode.clientWidth); };
        var htw = gsap.to(track, { x: function () { return -dist(); }, ease: "none",
          scrollTrigger: { trigger: tr, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: .6, refreshPriority: 7,
            invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: function (self) { bar.firstChild.style.transform = "scaleX(" + self.progress.toFixed(3) + ")"; } } });
        /* Keyboard: tabbing to a card off to the side scrolls the page to where that card is in view */
        var onFocus = function (e) {
          var card = e.target.closest(".t"); if (!card) return;
          var stt = htw.scrollTrigger, d = dist(); if (!d) return;
          var want = Math.max(0, Math.min(d, card.offsetLeft - 40));
          scrollTo({ top: stt.start + (want / d) * (stt.end - stt.start), behavior: "instant" });
        };
        track.addEventListener("focusin", onFocus);
        undo.push(function () { tr.classList.remove("hscroll"); bar.remove(); track.removeEventListener("focusin", onFocus); gsap.set(track, { clearProps: "transform" }); });
      }

      /* Why choose us: the five cards slide up into a stack while the section holds still */
      var why = document.getElementById("why"), cards = gsap.utils.toArray("#why .wcard");
      if (why && cards.length > 1) {
        why.classList.add("why-stack");
        cards.forEach(function (c) { c.classList.add("in"); });
        var count = document.createElement("span"); count.className = "why-count"; count.setAttribute("aria-hidden", "true");
        count.innerHTML = "<b>01</b> / 0" + cards.length;
        why.querySelector(".why-grid").appendChild(count);
        gsap.set(cards.slice(1), { yPercent: 118 });
        var wtl = gsap.timeline({ defaults: { ease: "power2.inOut", duration: 1 }, scrollTrigger: {
          trigger: why, start: "top top", end: "+=" + ((cards.length - 1) * 55) + "%", pin: true, scrub: .6, anticipatePin: 1, refreshPriority: 6,
          onUpdate: function (self) { count.firstChild.textContent = "0" + Math.min(cards.length, 1 + Math.round(self.progress * (cards.length - 1))); } } });
        cards.forEach(function (c, i) {
          if (!i) return;
          wtl.to(c, { yPercent: 0 }, i - 1);
          for (var k = 0; k < i; k++) wtl.to(cards[k], { scale: 1 - (i - k) * .05, y: -(i - k) * 18 }, i - 1);
        });
        undo.push(function () { why.classList.remove("why-stack"); count.remove(); gsap.set(cards, { clearProps: "transform" }); });
      }

      return function () { undo.forEach(function (f) { f(); }); };
    });

    /* Each trigger has a refreshPriority in page order (top first), so triggers below a pin
       are always measured after that pin has added its scroll distance */
    ScrollTrigger.refresh();
    addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  };

  /* pageReady (inline script) renders the cards; run after it */
  var orig = window.pageReady;
  window.pageReady = function () { if (orig) orig.apply(this, arguments); start(); };
})();
