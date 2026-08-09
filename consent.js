/* Cookietoestemming voor stacklines.nl
 *
 * Uitgangspunt: analytische cookies worden PAS geplaatst nadat de bezoeker
 * daar actief mee heeft ingestemd. Zolang er geen keuze is gemaakt, wordt
 * Google Analytics niet geladen. Dat is wat de privacyverklaring (sectie 6)
 * belooft, en wat de ePrivacy-richtlijn / art. 11.7a Telecommunicatiewet
 * vereist voor niet-noodzakelijke cookies.
 *
 * Bewuste keuzes:
 * - Weigeren is even zichtbaar en even makkelijk als accepteren: beide knoppen
 *   hebben dezelfde vorm, grootte en kleur, en "Alleen noodzakelijke" staat
 *   voorop. Een opvallend gekleurde "ja" naast een bleke "nee" stuurt de keuze,
 *   en een gestuurde toestemming is niet vrij gegeven en dus ongeldig.
 * - Geen cookiewall: de balk blokkeert de site niet, je kunt gewoon lezen.
 * - De keuze zelf staat in localStorage, niet in een cookie. Dat is functionele
 *   opslag die nodig is om je keuze te kunnen respecteren.
 * - Intrekken kan altijd, via elke link met data-cookie-prefs (staat in de
 *   footers). Bij intrekken worden de _ga-cookies actief opgeruimd, anders
 *   blijven ze na "weigeren" gewoon staan.
 * - In een iframe (de chatdemo's binnen demo.html) wordt de balk niet getoond,
 *   maar de keuze wordt wel gerespecteerd: localStorage is per origin gedeeld.
 * - VERSION ophogen zodra er een tracker bijkomt (bijvoorbeeld Clarity). Een
 *   oude toestemming dekt een nieuwe partij niet, dus dan wordt opnieuw gevraagd.
 */
(function () {
  'use strict';

  var KEY = 'sl-cookie-consent';
  var VERSION = 1;
  var GA_ID = 'G-DMELH2BQQL';
  var inIframe = window.self !== window.top;

  /* ---------- opgeslagen keuze ---------- */

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var val = JSON.parse(raw);
      if (!val || val.version !== VERSION) return null;   // nieuwe versie = opnieuw vragen
      return val;
    } catch (e) {
      return null;                                        // privémodus e.d.
    }
  }

  function save(analytics) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({
        version: VERSION,
        analytics: !!analytics,
        date: new Date().toISOString()                    // wanneer er is gekozen
      }));
    } catch (e) {}
  }

  /* ---------- Google Analytics ---------- */

  function loadAnalytics() {
    if (window.__slGaLoaded) return;
    window.__slGaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  /* Na intrekken blijven _ga / _gid anders gewoon op het apparaat staan. */
  function clearAnalyticsCookies() {
    var host = location.hostname;
    var bare = host.replace(/^www\./, '');
    var domains = ['', host, '.' + host, bare, '.' + bare];

    document.cookie.split(';').forEach(function (raw) {
      var name = raw.split('=')[0].trim();
      if (!name) return;
      if (name.indexOf('_ga') !== 0 && name.indexOf('_gid') !== 0) return;

      domains.forEach(function (d) {
        document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
          (d ? '; domain=' + d : '');
      });
    });
  }

  /* ---------- de balk ---------- */

  var bar = null;

  function build() {
    if (bar) return bar;

    bar = document.createElement('div');
    bar.className = 'cookiebar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookiemelding');
    bar.innerHTML =
      '<div class="cookiebar__inner">' +
        '<p class="cookiebar__text">' +
          'Stacklines plaatst alleen cookies die nodig zijn om de site te laten ' +
          'werken. Voor statistieken over het sitegebruik vraag ik vooraf je ' +
          'toestemming. Zie de <a href="/voorwaarden#privacy">privacyverklaring</a> ' +
          'voor meer informatie.' +
        '</p>' +
        '<div class="cookiebar__actions">' +
          '<button type="button" class="cookiebar__btn" data-consent="nee">Alleen noodzakelijke</button>' +
          '<button type="button" class="cookiebar__btn" data-consent="ja">Statistieken toestaan</button>' +
        '</div>' +
      '</div>';

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (!btn) return;
      choose(btn.getAttribute('data-consent') === 'ja');
    });

    document.body.appendChild(bar);
    return bar;
  }

  function show() {
    if (inIframe) return;
    build();
    // in de volgende frame, zodat de opacity-transitie loopt
    window.requestAnimationFrame(function () { bar.classList.add('is-open'); });
  }

  function hide() {
    if (bar) bar.classList.remove('is-open');
  }

  function choose(analytics) {
    save(analytics);
    if (analytics) loadAnalytics();
    else clearAnalyticsCookies();
    hide();
  }

  /* ---------- start ---------- */

  var stored = read();

  if (stored && stored.analytics) {
    loadAnalytics();
  } else if (!stored) {
    // nog geen keuze: niets laden, wel vragen (behalve in een iframe)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', show);
    } else {
      show();
    }
  }

  /* Voorkeuren opnieuw openen vanuit de footer. Delegated, zodat het ook werkt
     op pagina's waar de link later in de DOM komt. */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-cookie-prefs]');
    if (!link) return;
    e.preventDefault();
    build();
    window.requestAnimationFrame(function () { bar.classList.add('is-open'); });
  });
})();
