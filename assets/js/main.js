/* S-Glow landing page — vanilla JS, tanpa dependency */
(function () {
  'use strict';

  // GANTI: nomor WhatsApp Silvi (format internasional, tanpa "+" / spasi)
  var WA_NUMBER = '62XXXXXXXXXX';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- WhatsApp links ---------- */
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(a.dataset.msg || '');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });

  /* ---------- Problem picker ---------- */
  var probs = document.querySelectorAll('.prob');
  var verdict = document.querySelector('.verdict');
  var vText = document.querySelector('.verdict__txt');
  var AREA = { rambut: 'rambut', kulit: 'kulit', kuku: 'kuku', nutrisi: 'nutrisi harian' };
  probs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') !== 'true');
      var on = document.querySelectorAll('.prob[aria-pressed="true"]');
      var areas = [];
      on.forEach(function (b) { var a = AREA[b.dataset.area]; if (areas.indexOf(a) < 0) areas.push(a); });
      verdict.classList.toggle('is-on', on.length > 0);
      vText.textContent = on.length === 0
        ? vText.dataset.empty
        : 'Kamu memilih ' + on.length + ' kondisi (' + areas.join(', ') + '). S-Glow diformulasikan untuk rambut, kulit & kuku sekaligus.';
    });
  });

  /* ---------- Komposisi: orbit interaktif ---------- */
  // urutan = urutan node di orbit (index.html)
  var ICO = {
    cys: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M8.3 11 15.7 8M8.3 13l7.4 3"/>',
    col: '<path d="M7 3c5 3 5 6 0 9s-5 6 0 9M17 3c-5 3-5 6 0 9s5 6 0 9M8.5 7.5h7M8.5 16.5h7"/>'
  };
  var INGR = [
    { name: 'Vitamin C', src: 'Asam askorbat · antioksidan', c: '#f29a1f', img: ['lemon', 'yuzu'],
      key: 'Bersama kolagen, membentuk struktur kolagen tiga rantai yang kuat.',
      desc: 'Menjaga elastisitas kulit & kulit kepala, melindungi akar & folikel rambut, serta membantu menetralisir radikal bebas.', t: ['rambut', 'kulit'] },
    { name: 'Oryza Polyamine', src: 'Ekstrak benih beras Jepang · paten', c: '#9fb33a', img: ['oryza'],
      key: 'Memperpanjang fase pertumbuhan aktif folikel rambut.',
      desc: 'Meningkatkan pertumbuhan rambut dan membuat rambut berkilau. Molekulnya kecil (di bawah 250) sehingga mudah diserap tubuh.', t: ['rambut'] },
    { name: 'Lynside® Forte B', src: 'Nutrisi ragi Perancis · paten', c: '#d9b46a', img: ['lynside'],
      key: 'Mengandung 8 vitamin B kompleks esensial.',
      desc: 'Merangsang pertumbuhan sel kuku baru, membantu memperbaiki kondisi kulit (B3, B5) dan mengatur pigmen kulit (B12).', t: ['rambut', 'kulit', 'kuku'] },
    { name: 'L-Sistein', src: 'Asam amino · prekursor glutation', c: '#7a9aa8', ico: ICO.cys,
      key: 'Membantu mengurangi indeks melanin kulit.',
      desc: 'Mengurangi pigmentasi serta membantu mencerahkan kulit.', t: ['kulit'] },
    { name: 'Kolagen', src: 'Kaya asam amino', c: '#ec6f95', ico: ICO.col,
      key: 'Dapat berubah menjadi keratin rambut dan kuku.',
      desc: 'Meningkatkan elastisitas & ketebalan rambut, memperkuat kuku, menjaga kelembapan kulit dan mengurangi kerutan.', t: ['rambut', 'kulit', 'kuku'] }
  ];

  var stage = document.querySelector('.stage');
  if (stage) {
    var nodes = stage.querySelectorAll('.node');
    var core = stage.querySelector('.core');
    var count = stage.querySelector('.core__count b');
    var card = document.getElementById('ingr-card');
    var f = {
      name: card.querySelector('.icard__name'),
      src: card.querySelector('.icard__src'),
      key: card.querySelector('.icard__key'),
      desc: card.querySelector('.icard__desc'),
      media: card.querySelector('.icard__media'),
      tags: card.querySelectorAll('.icard__tags li'),
      dots: card.querySelectorAll('.icard__dots i')
    };
    var cur = 0, timer = null, userTook = false;

    var paint = function (i) {
      var d = INGR[i];
      f.name.textContent = d.name;
      f.src.textContent = d.src;
      f.key.textContent = d.key;
      f.desc.textContent = d.desc;
      f.media.innerHTML = d.img
        ? d.img.map(function (n) { return '<img src="assets/img/ingr-' + n + '.webp" alt="" width="320" height="320">'; }).join('')
        : '<span class="icard__ico"><svg viewBox="0 0 24 24">' + d.ico + '</svg></span>';
      f.tags.forEach(function (li) { li.classList.toggle('on', d.t.indexOf(li.dataset.t) > -1); });
      f.dots.forEach(function (dot, k) { dot.classList.toggle('on', k === i); });
    };

    var select = function (i, animate) {
      cur = (i + INGR.length) % INGR.length;
      var d = INGR[cur];
      nodes.forEach(function (n, k) { n.setAttribute('aria-pressed', k === cur); });
      stage.style.setProperty('--cur', d.c);
      card.style.setProperty('--c', d.c);
      count.textContent = cur + 1;
      core.classList.remove('pulse'); void core.offsetWidth; core.classList.add('pulse');
      if (animate === false || reduceMotion) { paint(cur); return; }
      card.classList.add('swap');
      setTimeout(function () { paint(cur); card.classList.remove('swap'); }, 220);
    };

    var stopAuto = function () {
      userTook = true;
      clearInterval(timer);
      stage.classList.add('is-paused');
    };

    nodes.forEach(function (n) {
      n.addEventListener('click', function () { stopAuto(); select(+n.dataset.i); });
    });
    card.querySelectorAll('.ibtn').forEach(function (b) {
      b.addEventListener('click', function () { stopAuto(); select(cur + (+b.dataset.step)); });
    });

    // swipe kiri/kanan di kartu
    var x0 = null;
    card.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    card.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { stopAuto(); select(cur + (dx < 0 ? 1 : -1)); }
      x0 = null;
    });

    var fbtns = document.querySelectorAll('.filter__btn');
    fbtns.forEach(function (fb) {
      fb.addEventListener('click', function () {
        var want = fb.dataset.f, first = -1;
        fbtns.forEach(function (o) { o.setAttribute('aria-pressed', o === fb); });
        nodes.forEach(function (n, k) {
          var ok = want === 'semua' || n.dataset.t.split(' ').indexOf(want) > -1;
          n.classList.toggle('dim', !ok);
          if (ok && first < 0) first = k;
        });
        stopAuto();
        if (want !== 'semua' && INGR[cur].t.indexOf(want) < 0) select(first);
      });
    });

    select(0, false);

    // masuk viewport: bahan terbang ke orbit + autoplay; keluar: jeda
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis) stage.classList.add('in');
      clearInterval(timer);
      if (vis && !userTook && !reduceMotion) {
        timer = setInterval(function () { select(cur + 1); }, 3800);
      }
    }, { threshold: 0.4 }).observe(stage);
  }

  /* ---------- Testimoni rail dots ---------- */
  var rail = document.querySelector('.rail');
  if (rail) {
    var dots = document.querySelectorAll('.rail__dots i');
    var cards = rail.querySelectorAll('.tcard');
    rail.addEventListener('scroll', function () {
      var mid = rail.scrollLeft + rail.clientWidth / 2, best = 0, bestD = Infinity;
      cards.forEach(function (c, k) {
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = k; }
      });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === best); });
    }, { passive: true });
  }

  /* ---------- Screenshot testimoni (dialog) ---------- */
  var shot = document.querySelector('dialog.shot');
  if (shot && shot.showModal) {
    var shotImg = shot.querySelector('img');
    document.querySelectorAll('.js-shot').forEach(function (b) {
      b.addEventListener('click', function () { shotImg.src = b.dataset.src; shot.showModal(); });
    });
    shot.addEventListener('click', function (e) { if (e.target === shot) shot.close(); });
  }

  /* ---------- Sticky dock: muncul setelah hero lewat, hilang di CTA ---------- */
  var dock = document.querySelector('.dock');
  var hero = document.querySelector('.hero');
  var cta = document.getElementById('order');
  if (dock && hero && cta) {
    var heroOut = false, ctaIn = false;
    var upd = function () { dock.classList.toggle('show', heroOut && !ctaIn); };
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(function (e) { ctaIn = e[0].isIntersecting; upd(); }).observe(cta);
  }
})();
