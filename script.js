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
      const subject = encodeURIComponent(`Bericht via stacklines.nl — ${name}`);
      const body = encodeURIComponent(
        `${message}\n\n— ${name}\n${email}`
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
      // viewBox-hoogte 200 = vh, dus translateY in units = scrollY * 200/vh; dat
      // zakt 1:1 met de scroll. Modulo de golf-periode (100) → naadloze lus.
      const u = ((window.scrollY * 200) / vh) % 100;
      snake.style.transform = `translateY(${u}px)`;
    };
    window.addEventListener('scroll', () => {
      if (snakeTicking) return;
      snakeTicking = true;
      requestAnimationFrame(moveSnake);
    }, { passive: true });
    moveSnake();
  }

  /* ---- 8. Postvak-assistent (hero-demo) ---------------------
     Typt een mailvraag, "denkt" even en toont dan de gevonden mail.
     Loopt daarna door. Markup staat in de hero, styling in style.css. */
  const QUERY = 'Zoek de mail van Van der Berg over de offerte';
  const SPEED = { type: 38, start: 800, afterType: 600, think: 1900, hold: 5400 };

  const MARK = '<svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="3" rx="1.5" fill="#f0560f"/><rect x="3" y="10.5" width="10" height="3" rx="1.5" fill="#ff9a4d"/><rect x="3" y="16" width="14" height="3" rx="1.5" fill="#f7efe2"/></svg>';

  const THINKING =
    '<div class="sl-reply">' +
      '<div class="sl-reply__mark">' + MARK + '</div>' +
      '<div class="sl-thinking">Even zoeken in je mailbox' +
        '<span class="sl-thinking__dots"><i></i><i></i><i></i></span>' +
      '</div>' +
    '</div>';

  const RESULT =
    '<div class="sl-reply">' +
      '<div class="sl-reply__mark">' + MARK + '</div>' +
      '<div class="sl-email">' +
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
        '</div>' +
      '</div>' +
    '</div>';

  const assistant = document.querySelector('[data-sl-assistant]');
  if (assistant) {
    const typedEl = assistant.querySelector('[data-sl-typed]');
    const caretEl = assistant.querySelector('[data-sl-caret]');
    const responseEl = assistant.querySelector('[data-sl-response]');

    if (typedEl && responseEl) {
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));

      (async function loop() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          typedEl.textContent = '';
          if (caretEl) caretEl.style.display = '';
          responseEl.innerHTML = '';
          await wait(SPEED.start);
          for (let i = 1; i <= QUERY.length; i++) {
            typedEl.textContent = QUERY.slice(0, i);
            await wait(SPEED.type);
          }
          await wait(SPEED.afterType);
          if (caretEl) caretEl.style.display = 'none';
          responseEl.innerHTML = THINKING;
          await wait(SPEED.think);
          responseEl.innerHTML = RESULT;
          await wait(SPEED.hold);
        }
      })();
    }
  }
})();
