Dr. Bobby Thomas Dental & Implant Centre - website (static HTML/CSS/JS)

Open dental-site/index.html through a local web server (not by double-clicking), e.g.:
  cd dental-site
  python -m http.server 8000      then visit http://localhost:8000

Where things are:
  index.html            homepage
  about, treatments, doctors, clinics, gallery, tourism, careers, contact .html
  treatment.html?id=..., doctor.html?id=..., clinic.html?id=...   detail pages (rendered from assets/data.js)
  assets/data.js        ALL page content (from the client Word documents) - edit text here
  assets/img/           photographs; doctor photos: assets/img/doctor-<name>.png
  assets/fx.js / fx.css gradient shapes + card tilt

Placeholders to replace before launch:
  assets/img/doctors-group.png   stock models (NOT the doctors) - replace with the real group photo (transparent PNG)
  Dentofacial Care page and the About page 'Our Story' section are DRAFT copy, pending the clinic's approval
  Dr. Heena / Dr. Vandana Ramesh have no photo yet (initials shown): add a "photo" path in assets/data.js
  The contact form is not connected to anything yet
