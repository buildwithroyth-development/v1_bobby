/* Listing pages (treatments, doctors, clinics, gallery): cards built from SITE data, same components as the homepage previews. */
(function () {
  var S = window.SITE, U = window.UI, page = document.body.dataset.page, out = document.getElementById("list");

  if (out && page === "treatments") {
    out.className = "t-grid";
    out.innerHTML = S.treatments.map(function (t) {
      return '<a class="t" href="treatment.html?id=' + t.id + '" data-reveal><div class="ph" data-img="treat-' + t.id + '" data-alt=""></div>' +
        '<div class="txt"><h2 class="t-name">' + U.esc(t.name) + '<span class="arr" aria-hidden="true">→</span></h2><p>' + U.esc(t.short) + '</p></div></a>';
    }).join("");
  }

  var team = document.getElementById("teamStrip");
  if (team) out = team;   /* About page: the same doctor tiles */
  if (out && (page === "doctors" || team)) {
    var gp = document.getElementById("group");
    if (gp && S.doctorsGroup) {
      gp.innerHTML = '<div class="section-head" style="margin-bottom:1.6rem"><h2 class="h2" data-reveal>Meet Our Group of <span class="em">Experts</span></h2></div>' +
        '<div class="group-pic" id="groupPic"><img src="' + U.esc(S.doctorsGroup) + '" alt="' + U.esc("Group photograph of our doctors: " + S.doctors.map(function (x) { return x.name; }).join(", ")) + '"></div>' +
        '<h2 class="h3 group-sub" data-reveal>Our Doctors</h2>';
      var stage = document.getElementById("groupPic"), gimg = stage.firstChild;
      if ("IntersectionObserver" in window) {
        var gio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { stage.classList.add("in"); gio.disconnect(); } }, { threshold: .2 });
        gio.observe(stage);
      } else stage.classList.add("in");
      if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
        stage.addEventListener("pointermove", function (e) {
          var r = stage.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
          gimg.style.translate = (px * -22).toFixed(1) + "px " + (py * -10).toFixed(1) + "px";
        });
        stage.addEventListener("pointerleave", function () { gimg.style.translate = "0 0"; });
      }
    }
    out.className = "team-grid fig-grid";
    out.innerHTML = S.doctors.map(function (d) { return U.figure(d); }).join("");
  }

  if (out && page === "clinics") {
    out.className = "locs";
    out.innerHTML = S.clinics.map(function (c, ci) {
      var techNames = c.tech.map(function (k) { return S.tech[k].name; });
      return '<article class="card loc" data-reveal><div class="ph" data-uncover style="--d:' + (ci * 140) + 'ms" data-img="clinic-' + c.id + '" data-alt="' + U.esc(c.label) + '"></div><div class="body">' +
        '<h2 class="loc-name">' + U.esc(c.name) + '</h2><address>' + U.esc(c.address) + '</address>' +
        '<ul class="chips" style="list-style:none;padding:0;margin:0">' + techNames.map(function (n) { return '<li class="chip">' + U.esc(n) + '</li>'; }).join("") + '</ul>' +
        '<p class="muted" style="font-size:.88rem">Nearby: ' + c.areas.map(U.esc).join(", ") + '</p>' +
        '<div class="actions"><a class="btn btn-sm" href="clinic.html?id=' + c.id + '">View clinic</a><a class="btn btn-ghost btn-sm" href="' + c.map + '" target="_blank" rel="noopener">Directions</a><a class="btn btn-ghost btn-sm" href="' + S.phoneHref + '">' + U.esc(S.phone) + '</a></div>' +
      '</div></article>';
    }).join("");
    /* Clinic photographs uncover as they arrive */
    var unc = out.querySelectorAll("[data-uncover]");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) unc.forEach(function (el) { el.classList.add("in"); });
    else { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -12% 0px" }); unc.forEach(function (el) { io.observe(el); }); }
  }

  var cta = document.getElementById("cta");
  if (cta) cta.outerHTML = U.cta();
  pageReady();
})();
