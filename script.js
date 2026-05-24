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
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      mobileNav.hidden = !isOpen;
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Sluit menu bij klik op een link
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileNav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      });
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
})();
