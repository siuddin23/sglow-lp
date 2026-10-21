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
  probs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') !== 'true');
      var n = document.querySelectorAll('.prob[aria-pressed="true"]').length;
      verdict.classList.toggle('is-on', n > 0);
      vText.textContent = n === 0
        ? vText.dataset.empty
        : n === probs.length
          ? 'Kamu mengalami semuanya. S-Glow diformulasikan untuk keempatnya.'
          : 'Kamu memilih ' + n + ' kondisi. S-Glow diformulasikan untuk membantu semuanya.';
    });
  });

  /* ---------- Komposisi: orbit interaktif ---------- */
  var INGR = [
    { name: 'Lynside® Forte B', src: 'Ragi kaya vitamin B', c: '#d9b46a',
      desc: 'Mendukung metabolisme sel, pertumbuhan rambut, dan kekuatan kuku.', t: ['rambut', 'kuku'] },
    { name: 'Oryza Polyamine', src: 'Ekstrak benih padi', c: '#9fb33a',
      desc: 'Membantu meningkatkan ketebalan rambut dan mencegah kebotakan.', t: ['rambut'] },
    { name: 'L-Cysteine', src: 'Asam amino pembentuk keratin', c: '#7a9aa8',
      desc: 'Membantu pertumbuhan serta memperkuat rambut dan kuku.', t: ['rambut', 'kuku'] },
    { name: 'Collagen', src: 'Protein struktural', c: '#ec6f95',
      desc: 'Meningkatkan elastisitas kulit dan kekuatan rambut.', t: ['kulit', 'rambut'] },
    { name: 'Vitamin C', src: 'Ascorbic acid · antioksidan', c: '#f29a1f',
      desc: 'Membantu mencerahkan kulit dan mendukung pembentukan kolagen alami.', t: ['kulit'] }
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
      desc: card.querySelector('.icard__desc'),
      tags: card.querySelectorAll('.icard__tags li'),
      dots: card.querySelectorAll('.icard__dots i')
    };
    var cur = 0, timer = null, userTook = false;

    var paint = function (i) {
      var d = INGR[i];
      f.name.textContent = d.name;
      f.src.textContent = d.src;
      f.desc.textContent = d.desc;
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
