/* =========================================================
   Stacklines — script.js
   Vanilla JS, geen dependencies. Doet drie dingen:
   1. Fade-in van secties bij scrollen (IntersectionObserver)
   2. Sticky-header krijgt schaduw zodra je scrolt
   3. Mobiel menu open/dicht + contactformulier dat mailto: opent
   ========================================================= */

(function () {
  'use strict';

  /* ---- 1. Scroll-animaties ---------------------------------- */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    // Oudere browsers: gewoon meteen tonen
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* ---- 1b. Slinger per sectie tekent zich bij in beeld -----
     Toggle i.p.v. eenmalig: scroll je weg → ont-tekent zich,
     scroll je terug → tekent opnieuw. Geeft een "leeft mee"-gevoel. */
  const sectionWaves = document.querySelectorAll('.section-wave');
  if (sectionWaves.length && 'IntersectionObserver' in window) {
    const waveObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('drawn', entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );
    sectionWaves.forEach((w) => waveObserver.observe(w));
  } else {
    // Fallback: meteen getekend tonen
    sectionWaves.forEach((w) => w.classList.add('drawn'));
  }

  /* ---- 2. Header frosted state bij scrollen ----------------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- 3. Mobiel menu --------------------------------------- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (toggle && mobileNav) {
    const setMenuOpen = (isOpen) => {
      mobileNav.classList.toggle('open', isOpen);
      // Class-fallback voor de solide balk in browsers zonder :has()-ondersteuning.
      if (header) header.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Menu sluiten' : 'Menu openen');
    };
    toggle.addEventListener('click', () => {
      setMenuOpen(!mobileNav.classList.contains('open'));
    });

    // Sluit menu bij klik op een link
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    // Sluit met Escape of bij klik buiten het menu.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) setMenuOpen(false);
    });
    document.addEventListener('click', (e) => {
      if (mobileNav.classList.contains('open') &&
          !mobileNav.contains(e.target) && !toggle.contains(e.target)) {
        setMenuOpen(false);
      }
    });
  }

  /* ---- 4. Sticky flow-rail (links) -------------------------- */
  // Bepaalt welke sectie nu in beeld is en zet die node "actief".
  // Daarnaast: groei van de progress-fill langs de rail-track, en
  // licht/donker omschakelen wanneer de contact-sectie zichtbaar wordt.
  const rail = document.querySelector('.flow-rail');
  if (rail) {
    const railLinks = rail.querySelectorAll('a[data-section]');
    const sections = Array.from(railLinks)
      .map((a) => document.getElementById(a.dataset.section))
      .filter(Boolean);

    const setActive = (id) => {
      const idx = Array.from(railLinks).findIndex((a) => a.dataset.section === id);
      railLinks.forEach((a, i) => {
        a.classList.toggle('active', i === idx);
        // Alle dots boven de actieve markeren we als "passed" (oranje gevuld)
        a.classList.toggle('passed', idx >= 0 && i < idx);
      });
    };

    // Welke sectie zit "het meest in het midden" van het scherm?
    const updateRail = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let current = null;
      for (const s of sections) {
        if (s.offsetTop <= mid) current = s;
      }
      if (current) setActive(current.id);
      else railLinks.forEach((a) => a.classList.remove('active', 'passed'));

      // Progress fill: van eerste tot laatste sectie.
      // Bij de bodem van de pagina forceren we 100%, anders zou de balk
      // net niet vollopen omdat mid het einde nooit voorbij kan.
      const first = sections[0];
      const last = sections[sections.length - 1];
      const start = first.offsetTop;
      const end = last.offsetTop + last.offsetHeight;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const atBottom = window.scrollY >= maxScroll - 4;
      const progress = atBottom
        ? 1
        : Math.max(0, Math.min(1, (mid - start) / (end - start)));
      rail.style.setProperty('--rail-progress', progress.toFixed(3));

      // Donker/licht: switch zodra contact-sectie het midden bereikt
      const contact = document.getElementById('contact');
      if (contact) {
        const onDark = contact.offsetTop <= mid;
        rail.classList.toggle('on-dark', onDark);
      }
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateRail(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', updateRail);
    updateRail();
  }

  /* ---- 5. Jaartal in footer --------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- 5b. "Terug naar boven"-link ---------------------------
     De link wijst naar #top (de sticky header). Browsers
     scrollen daar niet naartoe omdat een sticky element vanuit
     hun perspectief "al in beeld" is. Daarom expliciet via JS. */
  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* ---- 6. Contactformulier → opent mailto: ------------------ */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        alert('Vul alle velden in.');
        return;
      }

      // Pas hier het ontvangst-adres aan
      const to = 'hallo@stacklines.nl';
      const subject = encodeURIComponent(`Bericht via stacklines.nl van ${name}`);
      const body = encodeURIComponent(
        `${message}\n\n${name}\n${email}`
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }

  /* ---- 7. Mobiele "slang": doorgetrokken golf die 1:1 met de scroll omlaag
     zakt. De golf is periodiek (periode 100 in viewBox-eenheden = halve viewport),
     dus verschuiven met de scrollafstand modulo die periode loopt naadloos rond.
     Pauzeert vanzelf als je stopt met scrollen. Alleen actief op mobiel. */
  const snake = document.querySelector('.snake-move');
  if (snake) {
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 900px)');
    let snakeTicking = false;
    const moveSnake = () => {
      snakeTicking = false;
      if (reduceMq.matches || !mobileMq.matches) return;
      const vh = window.innerHeight || 1;
      // De laag is position:fixed, dus om de lijn te laten meebewegen MET de pagina
      // (en niet schijnbaar 2x zo snel) schuift 'ie OMHOOG terwijl je omlaag scrolt,
      // precies even snel als de content. viewBox-hoogte 200 = vh, dus 1 scroll-px =
      // 200/vh units. Modulo de golf-periode (100) → naadloze, oneindige lus.
      const u = ((window.scrollY * 200) / vh) % 100;
      snake.style.transform = `translateY(${-u}px)`;
    };
    window.addEventListener('scroll', () => {
      if (snakeTicking) return;
      snakeTicking = true;
      requestAnimationFrame(moveSnake);
    }, { passive: true });
    moveSnake();
  }

  /* ---- 8. Postvak-assistent (hero-demo) ---------------------
     Een doorlopende chat-thread: per scenario wordt een vraag getypt, "gedacht"
     en een antwoordkaart getoond. De berichten blijven staan en het venster
     scrollt mee omlaag (zoals een echte chat); na het laatste scenario (zie
     SCENARIOS) begint de thread schoon opnieuw. Scenario's: mail zoeken,
     samenvatten, concept schrijven, openstaande facturen, afspraak inplannen.
     Skelet staat in de hero (.sl-thread), kaarten worden hier opgebouwd,
     styling in style.css. */
  const SPEED = { type: 34, start: 650, afterType: 550, think: 1500, hold: 4200 };

  const MARK = '<svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="3" rx="1.5" fill="#f0560f"/><rect x="3" y="10.5" width="10" height="3" rx="1.5" fill="#ff9a4d"/><rect x="3" y="16" width="14" height="3" rx="1.5" fill="#f7efe2"/></svg>';

  // "Denkt"-balkje; label verschilt per scenario (zie scene.think).
  const thinking = (label) =>
    '<div class="sl-reply"><div class="sl-reply__mark">' + MARK + '</div>' +
      '<div class="sl-thinking">' + label +
        '<span class="sl-thinking__dots"><i></i><i></i><i></i></span>' +
      '</div>' +
    '</div>';

  // Wrapper rond elk antwoord: AI-merkje links, inhoud rechts.
  const reply = (inner) =>
    '<div class="sl-reply"><div class="sl-reply__mark">' + MARK + '</div>' +
    '<div class="sl-answer">' + inner + '</div></div>';

  // De demo loopt door deze scenario's heen (vraag wordt getypt, dan dit antwoord).
  // Het venster heeft een vaste hoogte (style.css, .sl-assistant__body min-height);
  // de mailkaart hieronder is de hoogste staat. Houd nieuwe kaarten daaronder.
  const SCENARIOS = [
    // 1. Mail zoeken
    { query: 'Zoek de mail van Van der Berg over de offerte', think: 'Even zoeken in je mailbox', result: reply(
      '<div class="sl-email__lead">Gevonden, dit lijkt de mail die je zoekt:</div>' +
      '<div class="sl-email__card">' +
        '<div class="sl-email__inner">' +
          '<div class="sl-email__top">' +
            '<div class="sl-email__avatar">V</div>' +
            '<div class="sl-email__from"><div class="sl-email__name">Van der Berg Installatie</div><div class="sl-email__meta">aan jou · offerte</div></div>' +
            '<div class="sl-email__date">12-06-2026</div>' +
          '</div>' +
          '<div class="sl-email__subject">Offerte verbouwing, definitieve versie</div>' +
          '<div class="sl-email__snippet">Hoi, bijgaand de definitieve offerte. De prijs is iets aangepast na ons gesprek, de rest staat in de bijlage…</div>' +
          '<div class="sl-email__attach">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c2592a" stroke-width="2"><path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>' +
            'Offerte-2451.pdf' +
          '</div>' +
        '</div>' +
        '<div class="sl-email__actions">' +
          '<div class="sl-email__action sl-email__action--primary">Openen</div>' +
          '<div class="sl-email__action">Samenvatten</div>' +
        '</div>' +
      '</div>'
    ) },

    // 2. Mails samenvatten
    { query: 'Vat de mailwisseling met Van der Berg samen', think: 'Even je mailbox doorlezen', result: reply(
      '<div class="sl-email__lead">Samenvatting van 6 mails:</div>' +
      '<div class="sl-email__card"><div class="sl-email__inner">' +
        '<ul class="sl-sum">' +
          '<li>De offerte is na het gesprek met 4% verlaagd.</li>' +
          '<li>De oplevering staat gepland in week 28.</li>' +
          '<li>Ze wachten nog op jouw akkoord op de planning.</li>' +
        '</ul>' +
        '<div class="sl-flag"><strong>Actiepunt</strong>Bevestig de planning vóór vrijdag.</div>' +
      '</div></div>'
    ) },

    // 3. Concept-antwoord schrijven
    { query: 'Schrijf een nette reactie op de offerte', think: 'Even een concept opstellen', result: reply(
      '<div class="sl-email__lead">Concept klaar om te versturen:</div>' +
      '<div class="sl-email__card">' +
        '<div class="sl-email__inner">' +
          '<div class="sl-draft__row"><span>Aan</span>Van der Berg Installatie</div>' +
          '<div class="sl-draft__row"><span>Onderwerp</span>Re: Offerte verbouwing</div>' +
          '<div class="sl-draft__body">Beste, dank voor de aangepaste offerte. Het voorstel ziet er goed uit en ik ga akkoord met de planning in week 28. Laten we volgende week de laatste details doornemen.</div>' +
        '</div>' +
        '<div class="sl-email__actions">' +
          '<div class="sl-email__action sl-email__action--primary">Verzenden</div>' +
          '<div class="sl-email__action">Aanpassen</div>' +
        '</div>' +
      '</div>'
    ) },

    // 4. Openstaande facturen
    { query: 'Welke facturen staan nog open?', think: 'Even zoeken in je boekhoudsysteem', result: reply(
      '<div class="sl-email__lead">3 openstaande facturen:</div>' +
      '<div class="sl-email__card"><div class="sl-email__inner">' +
        '<div class="sl-rows">' +
          '<div class="sl-row"><div class="sl-row__main"><div class="sl-row__name">Van der Berg Installatie</div><div class="sl-row__sub">F-2451 · 8 dagen over tijd</div></div><div class="sl-row__amt">€ 1.840</div></div>' +
          '<div class="sl-row"><div class="sl-row__main"><div class="sl-row__name">Jansen Advies</div><div class="sl-row__sub">F-2462 · vervalt morgen</div></div><div class="sl-row__amt">€ 620</div></div>' +
          '<div class="sl-row"><div class="sl-row__main"><div class="sl-row__name">De Wit Bouw</div><div class="sl-row__sub">F-2470 · loopt nog</div></div><div class="sl-row__amt">€ 2.310</div></div>' +
        '</div>' +
        '<div class="sl-total"><span>Totaal openstaand</span><strong>€ 4.770</strong></div>' +
      '</div></div>'
    ) },

    // 5. Afspraak inplannen
    { query: 'Plan een belafspraak volgende week', think: 'Even de agenda checken', result: reply(
      '<div class="sl-email__lead">Voorgesteld moment, vrij voor jullie allebei:</div>' +
      '<div class="sl-email__card">' +
        '<div class="sl-email__inner">' +
          '<div class="sl-slot">' +
            '<div class="sl-slot__date"><div class="sl-slot__day">DI</div><div class="sl-slot__num">23</div></div>' +
            '<div class="sl-slot__info"><div class="sl-slot__title">Belafspraak Van der Berg</div><div class="sl-slot__time">dinsdag 23 juni · 10:00 tot 10:30</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="sl-email__actions">' +
          '<div class="sl-email__action sl-email__action--primary">Inplannen</div>' +
          '<div class="sl-email__action">Ander moment</div>' +
        '</div>' +
      '</div>'
    ) },
  ];

  const assistant = document.querySelector('[data-sl-assistant]');
  if (assistant) {
    const body = assistant.querySelector('.sl-assistant__body');
    const thread = assistant.querySelector('[data-sl-thread]');

    if (body && thread) {
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));
      // Houd de laatste berichten in beeld terwijl de thread groeit.
      const scrollDown = () => body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });

      // Lege gebruikersbubbel met knipperende caret; geeft de bubbel terug.
      const addUserMsg = () => {
        const el = document.createElement('div');
        el.className = 'sl-msg sl-msg--user';
        el.innerHTML =
          '<div class="sl-bubble"><span class="sl-typed"></span><span class="sl-caret"></span></div>' +
          '<div class="sl-avatar sl-avatar--you">JIJ</div>';
        thread.appendChild(el);
        return el;
      };

      // AI-antwoord uit een HTML-string toevoegen; geeft het element terug.
      const addReply = (html) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const el = tmp.firstElementChild;
        thread.appendChild(el);
        return el;
      };

      let idx = 0;
      (async function loop() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const scene = SCENARIOS[idx];
          const q = scene.query;

          // Nieuwe ronde: thread schoonvegen en opnieuw beginnen.
          if (idx === 0) thread.innerHTML = '';
          await wait(SPEED.start);

          // 1. Vraag typen in een nieuwe gebruikersbubbel.
          const userEl = addUserMsg();
          const typedEl = userEl.querySelector('.sl-typed');
          const caretEl = userEl.querySelector('.sl-caret');
          scrollDown();
          for (let c = 1; c <= q.length; c++) {
            typedEl.textContent = q.slice(0, c);
            if (c % 4 === 0) scrollDown();
            await wait(SPEED.type);
          }
          if (caretEl) caretEl.remove();
          await wait(SPEED.afterType);

          // 2. "Denkt" even.
          const thinkEl = addReply(thinking(scene.think || 'Even zoeken in je mailbox'));
          scrollDown();
          await wait(SPEED.think);

          // 3. Antwoordkaart vervangt het denk-balkje.
          thinkEl.outerHTML = scene.result;
          scrollDown();
          await wait(SPEED.hold);

          idx = (idx + 1) % SCENARIOS.length;
        }
      })();
    }
  }

  /* ---- 9. Ticket-dashboard-demo (statistieken) -------------
     Cijfers tellen op en de balken groeien aan zodra de slide in beeld komt
     (de carrousel stuurt hiervoor een 'sl:show'-event, zie sectie 11). */
  const dash = document.querySelector('[data-sl-dash]');
  if (dash) {
    const countUp = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const dur = 1000;
      let started = null;
      el.textContent = '0' + suffix;
      const tick = (now) => {
        if (started === null) started = now;
        const p = Math.min(1, (now - started) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = () => {
      if (prefersReduce) {
        // Geen beweging: meteen de eindwaarden tonen.
        dash.querySelectorAll('.sl-kpi__num').forEach((el) => {
          el.textContent = (parseInt(el.dataset.count, 10) || 0) + (el.dataset.suffix || '');
        });
        dash.querySelectorAll('[data-w]').forEach((f) => { f.style.width = f.dataset.w; });
        return;
      }
      dash.querySelectorAll('.sl-kpi__num').forEach(countUp);
      // balken + de afhandeling-splitsing groeien aan (alles met data-w)
      dash.querySelectorAll('[data-w]').forEach((f, i) => {
        f.style.width = '0';
        // korte stagger zodat ze na elkaar aangroeien
        setTimeout(() => { f.style.width = f.dataset.w; }, 180 + i * 100);
      });
    };

    const slide = dash.closest('.sl-slide');
    if (slide) slide.addEventListener('sl:show', animate);
    // Als deze slide al actief is bij laden, meteen animeren.
    if (slide && slide.classList.contains('is-active')) animate();
  }

  /* ---- 10. Live activiteiten-log ---------------------------
     Regels tikken vanzelf binnen (bezig -> vinkje) en scrollen mee. */
  const logEl = document.querySelector('[data-sl-log]');
  if (logEl) {
    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    const logBody = logEl.closest('.sl-assistant__body');
    const ACTIONS = [
      'Factuur ontvangen en geboekt',
      'Ticket geclassificeerd',
      'Antwoord voorgesteld',
      'Overzicht naar klant gemaild',
      'Bestelling verwerkt',
      'Betaling afgeletterd',
      'Bonnetje uitgelezen',
      'Gegevens bijgewerkt',
    ];
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (m) => pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60);
    const scroll = () => { if (logBody) logBody.scrollTo({ top: logBody.scrollHeight, behavior: 'smooth' }); };

    let mins = 9 * 60 + 14;
    let ai = 0;
    (async function loop() {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (logEl.children.length >= 14) logEl.removeChild(logEl.firstElementChild);
        const row = document.createElement('div');
        row.className = 'sl-logrow';
        row.innerHTML =
          '<span class="sl-logrow__t">' + fmt(mins) + '</span>' +
          '<span class="sl-logrow__a">' + ACTIONS[ai % ACTIONS.length] + '</span>' +
          '<span class="sl-check is-active"></span>';
        logEl.appendChild(row);
        scroll();
        await wait(620);
        const check = row.querySelector('.sl-check');
        check.classList.remove('is-active');
        check.classList.add('is-done');
        scroll();
        ai++;
        mins += 1 + (ai % 3);
        await wait(1500);
      }
    })();
  }

  /* ---- 11. Demo-carrousel (pijltjes + dots) ----------------
     Wisselt tussen de demo's; alleen de actieve slide is zichtbaar. */
  const demos = document.querySelector('[data-sl-demos]');
  if (demos) {
    const slides = Array.from(demos.querySelectorAll('.sl-slide'));
    const dotsWrap = demos.querySelector('[data-sl-dots]');
    const prevBtn = demos.querySelector('[data-sl-prev]');
    const nextBtn = demos.querySelector('[data-sl-next]');
    let cur = 0;

    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'sl-dot-nav';
      d.setAttribute('aria-label', 'Demo ' + (i + 1));
      d.addEventListener('click', () => go(i));
      if (dotsWrap) dotsWrap.appendChild(d);
      return d;
    });

    function go(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('is-active', j === cur));
      dots.forEach((d, j) => d.classList.toggle('is-active', j === cur));
      // Laat de actieve slide weten dat 'ie in beeld komt (bv. dashboard animeert dan).
      slides[cur].dispatchEvent(new CustomEvent('sl:show'));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => go(cur - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(cur + 1));
    go(0);
  }

  /* ---- 12. Reduced-motion: SVG-datapulsen stoppen ----------
     CSS `animation:none` raakt SMIL (<animateMotion>) niet, dus hier de
     bewegende stipjes in de koppelingen-demo verbergen. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.sl-net circle').forEach((c) => { c.style.display = 'none'; });
  }
})();
