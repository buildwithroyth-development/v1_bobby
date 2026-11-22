/* Shapes (scroll + pointer parallax), card tilt, and the "When might you need this treatment?" picker. */
(function () {
  var S = window.SITE, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---------- page-level shapes: pages without hand-placed shapes get a layer behind the whole page ---------- */
  var mainEl = document.querySelector("main"), pgLayer = null;
  function buildPageShapes() {
    if (!pgLayer) return;
    var h = mainEl.scrollHeight, n = Math.max(3, Math.min(12, Math.round(h / 640)));
    var forms = ["dia", "sq", "band", "tri", "dia", "bowl", "sq", "band"], vars = ["soft", "rose", "deep", "rose", ""], anims = ["", "b", "c"];
    var html = "";
    for (var i = 0; i < n; i++) {
      var f = forms[i % forms.length], left = i % 2 === 0, top = ((i + .35) / n * 100).toFixed(1);
      var size = [15, 11, 24, 9, 13, 20, 10, 26][i % 8];
      var st = "top:" + top + "%;" + (left ? "left" : "right") + ":" + (-3 - (i % 3) * 2.5) + "%;--t:" + (17 + (i * 3) % 11) + "s;--dl:-" + ((i * 5) % 13) + "s;";
      if (f === "band") st += "width:clamp(180px," + size + "vw,420px);height:clamp(26px," + (size / 6).toFixed(1) + "vw,56px);";
      else if (f === "bowl") st += "width:clamp(150px," + size * .8 + "vw,360px);height:clamp(60px," + (size * .35).toFixed(1) + "vw,150px);";
      else st += "width:clamp(70px," + size * .8 + "vw,300px);aspect-ratio:1;";
      html += '<span class="sh ' + f + " " + vars[i % vars.length] + " " + anims[i % 3] + '" style="' + st + '"><i></i></span>';
    }
    pgLayer.innerHTML = html;
    collect();
  }
  if (mainEl && !document.querySelector(".shp")) {
    pgLayer = document.createElement("div");
    pgLayer.className = "shp pg"; pgLayer.setAttribute("aria-hidden", "true");
    mainEl.insertBefore(pgLayer, mainEl.firstChild);
    mainEl.classList.add("has-shapes");
  }

  /* ---------- shapes: parallax on scroll, drift toward the pointer ---------- */
  var shapes = [];
  function collect() {
    shapes = Array.prototype.slice.call(document.querySelectorAll(".shp .sh")).map(function (el, i) {
      var pg = !!el.closest(".shp.pg");
      return { el: el, pg: pg, sec: pg ? null : el.closest("section, main"), layer: pg ? el.closest(".shp") : null, s: [.08, -.1, .14, -.06][i % 4] * (reduce ? .4 : 1), m: [14, -18, 10][i % 3] * (reduce ? .4 : 1) };
    });
  }
  var tx = 0, ty = 0, cx = 0, cy = 0, q = false;
  function frame() {
    q = false;
    cx += (tx - cx) * .07; cy += (ty - cy) * .07;
    var vh = innerHeight;
    shapes.forEach(function (o) {
      var off;
      if (o.pg) {
        var lr = o.layer.getBoundingClientRect(), y = lr.top + o.el.offsetTop + o.el.offsetHeight / 2;
        if (y < -300 || y > vh + 300) return;
        off = y - vh / 2;
      } else {
        var r = o.sec.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        off = r.top + r.height / 2 - vh / 2;
      }
      o.el.style.transform = "translate3d(" + (cx * o.m).toFixed(1) + "px," + (off * o.s + cy * o.m).toFixed(1) + "px,0)";
    });
    if (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) req();
  }
  function req() { if (!q) { q = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  if (fine) document.addEventListener("pointermove", function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; req(); }, { passive: true });
  collect(); buildPageShapes(); req();
  addEventListener("load", function () { buildPageShapes(); req(); });
  var rz; addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { buildPageShapes(); req(); }, 250); });


  /* ---------- tilt on cards ---------- */
  if (fine && !reduce) {
    var SEL = ".t, .dcard, .key, .tc", cur = null;
    document.addEventListener("pointermove", function (e) {
      var el = e.target.closest && e.target.closest(SEL);
      if (cur && cur !== el) { cur.style.transform = ""; cur.removeAttribute("data-tilting"); cur = null; }
      if (!el) return;
      var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      el.setAttribute("data-tilting", ""); cur = el;
      el.style.transform = "perspective(900px) rotateY(" + (px * 6).toFixed(2) + "deg) rotateX(" + (-py * 6).toFixed(2) + "deg) translateY(-3px)";
    }, { passive: true });
  }

  /* ---------- picker: each chip is the first item of a treatment's own "When might you need…" list ---------- */
  var chips = document.getElementById("pickChips"), card = document.getElementById("pickCard");
  if (chips && card && S) {
    var items = S.treatments.map(function (t) {
      var s = t.sections.filter(function (x) { return x.type === "list" && x.style !== "check"; })[0];
      return { t: t, label: s ? s.items[0] : t.name };
    });
    chips.innerHTML = items.map(function (o, i) { return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + esc(o.label) + '</button>'; }).join("");
    var show = function (i, instant) {
      var t = items[i].t;
      var html = '<div class="pc-ph"><img src="assets/img/treat-' + t.id + '.jpg" alt="" decoding="async"></div><div class="pc-tx"><span class="pc-k">Treatment</span><h3>' + esc(t.name) + '</h3><p>' + esc(t.short) + '</p>' +
        '<p class="pc-note">Your dentist will explain suitable options after an examination.</p>' +
        '<div class="actions"><a class="btn" href="treatment.html?id=' + t.id + '">Read more <span class="arrow" aria-hidden="true">→</span></a><a class="btn btn-ghost" href="contact.html?treatment=' + t.id + '">Book a consultation</a></div></div>';
      if (instant || reduce) { card.innerHTML = html; return; }
      card.classList.add("swap");
      setTimeout(function () { card.innerHTML = html; void card.offsetWidth; card.classList.remove("swap"); }, 170);
    };
    chips.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute("aria-pressed", c === b); });
      show(+b.dataset.i);
    });
    show(0, true);
  }
})();
