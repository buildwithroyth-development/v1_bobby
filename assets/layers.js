/* Layered parallax (shared).
   A [data-layers] container holds any number of [data-depth] layers. As the container passes through
   the screen each layer is offset by its depth: positive depths are closer (they run ahead of the scroll),
   negative depths are further away (they lag behind it). Containers with data-mouse also drift with the
   pointer on desktop. Everything eases toward its target every frame, so it trails softly rather than snapping.
   Only the `translate` property is used, so it never fights a layer's own transform / clip-path entrance.

   Container options
     data-anchor="top"   rest position is the top of the page (heroes); otherwise the screen centre
     data-range="120"    pixels of travel per unit of depth over one viewport of scroll (default 60)
     data-mouse          also follow the pointer (desktop only)                                          */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function init() {
    var comps = Array.prototype.map.call(document.querySelectorAll("[data-layers]"), function (c) {
      return {
        el: c, top: c.dataset.anchor === "top", range: parseFloat(c.dataset.range) || 60, mouse: c.hasAttribute("data-mouse"),
        items: Array.prototype.map.call(c.querySelectorAll("[data-depth]"), function (l) {
          l.style.willChange = "translate";
          return { el: l, d: parseFloat(l.dataset.depth) || 0, x: 0, y: 0 };
        })
      };
    });
    if (!comps.length) return;

    var mx = 0, my = 0, running = false;
    function frame() {
      var moving = false, vh = innerHeight, k = innerWidth < 800 ? 0.5 : 1;
      comps.forEach(function (c) {
        var r = c.el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) return;                          /* well off screen: leave it */
        var off = c.top ? r.top / vh : (r.top + r.height / 2 - vh / 2) / vh;       /* 0 at rest, then -1 … 1 */
        c.items.forEach(function (l) {
          var tx = fine && c.mouse ? -mx * l.d * 16 : 0;
          var ty = off * l.d * c.range * k + (fine && c.mouse ? -my * l.d * 10 : 0);
          l.x += (tx - l.x) * 0.09; l.y += (ty - l.y) * 0.09;
          if (Math.abs(tx - l.x) > 0.05 || Math.abs(ty - l.y) > 0.05) moving = true;
          l.el.style.translate = l.x.toFixed(2) + "px " + l.y.toFixed(2) + "px";
        });
      });
      if (moving) requestAnimationFrame(frame); else running = false;
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }
    addEventListener("scroll", kick, { passive: true });
    addEventListener("resize", kick);
    if (fine) addEventListener("pointermove", function (e) {
      mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1; kick();
    }, { passive: true });
    kick();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
