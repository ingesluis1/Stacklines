# Stacklines — landingspagina

Statische one-pager voor Stacklines (automatiseringsbedrijf MKB/ZZP, Apeldoorn).
Geen build-tools, drie losse bestanden:

- `index.html` — alle structuur + inline SVG (slingers, iconen, logo)
- `style.css` — alle styling, kleuren via `:root` variabelen
- `script.js` — vanilla JS, geen dependencies

## Deploy

- GitHub: `ingesluis1/Stacklines` (private, main branch)
- Cloudflare Workers verbonden met de repo → elke `git push` deployt automatisch naar `stacklines.ingesluis1.workers.dev` (~30 sec)
- Custom domain `stacklines.nl` (Cloudflare DNS, nameservers staan al goed bij mijndomein) is nog **niet** gekoppeld — staat klaar voor zodra de site klaar is
- Lokale preview: dubbelklik `index.html`. Ctrl+F5 voor cache-bypass

## Designconventies (niet zomaar "fixen")

- **Kleuren via CSS-variabelen** in `:root` (espresso + oranje palet). Wijzig daar, niet hardcoded ergens diep
- **Doorlopende achtergrond-gloed**: één vaste laag (`body::before`, `position: fixed`, `z-index: -2`) met zachte radial-gradients achter de hele pagina. De lichte secties zijn zelf transparant, zodat er geen harde naden tussen secties zijn (eerder had elke sectie z'n eigen vignette, dat gaf zichtbare lijnen op de overgangen). Contact = espresso via `.section-dark` (dekt de gloed-laag af)
- **Scroll-snap `y mandatory`** op `html`, secties hebben `snap-align: start` + `snap-stop: always`. Instagram-reels-achtig gedrag is opzettelijk op desktop. **Op mobiel (≤900px) staat snap uit** en krijgen secties hun natuurlijke hoogte (zie sectie Mobiel)
- **Reveal-animaties**: `0.55s`, easing `cubic-bezier(.2,.7,.2,1)`, translate `14px`. Korte stagger op cards/steps (`.10s` per child). Niet langer maken — was bewust strakker gemaakt
- **Slinger-paden** (SVG `.section-wave` en `.hero-wave`):
  - Tekenen zich bij in-view, **ont-tekenen** bij wegscrollen (script.js toggle, niet `unobserve`)
  - Pulseren in tegenfase (`6s` loop, negatieve `animation-delay` voor phase shift). Hero heeft 3 lijnen die om de 2s opvolgend pieken
  - Deinen daarnaast heel subtiel op en neer (`floatY`, ±5px, 8s, per lijn een andere fase). Tunebaar bij `@keyframes floatY`
- **Hero-visual = een demo-carrousel** (rechterkolom). Vier mini-demo's op dezelfde plek, met pijltjes (‹ ›) + dots eronder om te wisselen (`.sl-demos` > `.sl-stage` > `.sl-slide`, controller in script.js sectie 11). De slides liggen op elkaar (`position:absolute`), de actieve is `position:relative` (bepaalt de hoogte) en de rest faden eroverheen met een lichte horizontale shift, dus géén clip/overflow nodig (de card-schaduw blijft heel). Alle vier delen dezelfde vensterchrome (`.sl-assistant__bar` + `.sl-assistant__body`, vaste hoogte 440px) zodat er niks springt bij wisselen. De vier demo's: **1. Postvak-assistent** (chat, sectie 8), **2. Ticket-dashboard** (statistieken: KPI's tellen op + balkgrafiek groeit aan, sectie 9, classes `.sl-dash*`/`.sl-kpi*`/`.sl-bar*`), **3. Automatisering** (live activiteiten-log dat binnentikt en meescrollt, sectie 10, `.sl-log`/`.sl-logrow`, gebruikt `.sl-check`), **4. Koppelingen** (SVG-diagram met systemen + datapulsen via `<animateMotion>`, `.sl-net`, geen JS-loop). Het status-bolletje `.sl-check` (ring → spinner `.is-active` → groen vinkje `.is-done`) wordt door de log-demo gebruikt. **Belangrijk:** het dashboard animeert pas wanneer z'n slide in beeld komt; de carrousel-`go()` stuurt daarom een `sl:show`-CustomEvent naar de actieve slide, en de dashboard-demo luistert daarop (anders zou de count-up al gespeeld zijn terwijl de slide nog verborgen was). Andere loops draaien continu, ook op niet-zichtbare slides (lichtgewicht). Voorbeeldnamen/systemen zijn fictief en generiek (geen energiesector/klanten). Demo 1 details hieronder. **Het is een doorlopende chat-thread** (`SCENARIOS`-array in script.js sectie 8): per scenario wordt een vraag getypt, "gedacht" en een antwoordkaart getoond. De berichten **blijven staan** en het venster **scrollt mee omlaag** (zoals een echte chat); na het laatste scenario begint de thread schoon opnieuw (`if (idx === 0) thread.innerHTML = ''`). Scenario's: mail zoeken, mails samenvatten, concept-antwoord schrijven, openstaande facturen, afspraak inplannen. Elk scenario = `{query, think, result}`; `think` is het denk-label, antwoordkaarten worden via de `reply()`-helper gewrapt en hergebruiken grotendeels de `.sl-email__*`-classes plus een paar eigen (`.sl-sum`, `.sl-flag`, `.sl-draft__*`, `.sl-rows`/`.sl-row`/`.sl-total`, `.sl-slot__*`). Berichten worden in JS opgebouwd en aan `.sl-thread` toegevoegd; de gebruikersbubbel (`addUserMsg`) en AI-bubbel (`addReply`) worden dynamisch gemaakt, er staat dus géén vaste bubbel meer in de HTML. **Het venster heeft een vaste hoogte** met scroll (`.sl-assistant__body { height: 440px; overflow-y: auto }`, scrollbar verborgen). Voorbeeldnamen (Van der Berg, Jansen Advies, De Wit Bouw) zijn fictief en generiek. Eigen `--sl-*` tokens gescoped op `.sl-assistant`, palet matcht de site, font erft Inter. Twee-koloms breekpunt staat bewust op **901px** (= waar scroll-snap aangaat) zodat er geen tussenzone is waar de hero gestapeld binnen 100vh afsnijdt. Op mobiel (≤900px) stapelt de demo gecentreerd onder de tekst. *Historie:* eerder was de hero bewust minimaal (alleen tekst + slingers); een uitgebreide workflow/n8n-tekening was geprobeerd en verwijderd (te druk). De assistent-demo is na overleg met de user toegevoegd omdat 'ie inhoudelijk (mail zoeken/samenvatten) precies het AI-verhaal toont. Op mobiel komt i.p.v. de slingers een aparte "slang" terug (zie sectie Mobiel)
- **Hover op cards/steps**: `0.25s`, lift `6px`, icon-rotate `6°`. Geen "wiebelige" 8px+ meer

## Mobiel (≤900px)

> **Mobiele overhaul (audit via 4 parallelle agents + headless renders).** Kernpunten doorgevoerd: nav schakelt nu op **≤900px** naar de hamburger (voorheen pas ≤720, wat een krappe desktop-nav-tussenzone 721-900 gaf, alle nav/overlay-regels staan nu in het 900-blok); `html, body { overflow-x: clip }` als overflow-vangnet; `section[id] { scroll-margin-top: var(--header-h) }` zodat ankers niet onder de sticky header landen; responsieve koppen (`h1`/`h2` clamp-bodem verlaagd zodat ze op telefoons echt meeschalen); `:focus-visible`-ring op alle interactieve elementen; `--color-accent-text` (donkerder oranje) voor kleine tekst op licht (contrast); grotere tap-targets (hamburger 44px, carrousel-pijltjes 44px op mobiel, dots krijgen een onzichtbare `::before`-tapzone van 40px); footer leesbaarder. **Demo-carrousel op mobiel:** `.sl-assistant__body` hoogte 440→**400px** en het dashboard is compacter (kleinere gaps/KPI's, `.sl-bar__lbl` 88px) zodat het binnen 400px past (gemeten dashboard-inhoud ~375px). **Reduced-motion:** de dashboard-count-up (JS) en de SVG-datapulsen (`<animateMotion>`, sectie 12) worden nu ook netjes stilgezet, niet alleen de CSS-animaties. Geen horizontale overflow (gemeten op 469px headless-layout). Render-truc: headless pint de layout op ~469px en de screenshot-canvas = window-breedte, dus render met window-breedte ≥ layout (bv. 480) + `--force-device-scale-factor=2` om afkappen te voorkomen.

- **Geen scroll-snap, geen full-height secties.** `html { scroll-snap-type: none }`, `.hero`/`.section` worden `display: block` met `min-height: auto`. Reden: met `mandatory` snap werd content die hoger is dan het scherm onbereikbaar en schokkerig
- **Footer terug in de flow** (`position: static`) i.p.v. absoluut onderaan een 100vh-sectie
- **Achtergrond-slingers (`.hero-wave`/`.section-wave`) verborgen**: die werden lelijk samengedrukt door `preserveAspectRatio="none"` op smal scherm. De vignette-gloed van `body::before` blijft als achtergrond
- **Tegels kleiner**: minder padding op `.card`/`.step` (≤720px)
- **Hamburger-menu**:
  - Hamburger morpht naar een kruisje en terug, via `aria-expanded` op `.nav-toggle` (CSS-transities op de drie `span`s)
  - Menu is een **frosted (blur) overlay** die de pagina niet omlaag duwt (`position: absolute` onder de balk). Het **faded** in/uit (alleen opacity, géén transform/translate). Een geblurde laag verplaatsen hapert, want de browser moet dan elke frame opnieuw blurren
  - De header-balk wordt **solide** zodra het menu open is (`.site-header:has(.mobile-nav.open)`, plus class-fallback `.site-header.nav-open` via JS voor webviews zonder `:has()`), anders schijnt content door de transparante/frosted balk. Geef de balk dan géén `backdrop-filter`, want geneste backdrop-filters heffen de menu-blur op. De overlay heeft 0.82 dekking + een `@supports`-fallback naar solide bij geen blur-support. Sluit ook met Escape of klik-buiten
- **Slang op de achtergrond (`.bg-snake` + `.snake-move`/`.snake-line`)**: vervangt op mobiel de desktop-slingers. **Twee evenwijdige golflijnen in dezelfde fase** (`.s1` oranje, `.s2` peach, `.s2` staat 6 eenheden naast `.s1` zodat ze samen meegolven i.p.v. te kruisen, geen DNA-effect), in dezelfde zachte stijl/palet als de desktop-slingers (`snakeBreathe1`/`snakeBreathe2`; de -3s op `snakeBreathe2` is alleen een kleur-pulse-offset, niet de vorm). **Vloeiend, geen harde hoeken**: de bezier-controlepunten zijn per knooppunt gespiegeld (in/uit-handle collineair door het anker), dus de raaklijn loopt continu door. De laag is `position: fixed`; om te voorkomen dat de lijn schijnbaar 2x zo snel beweegt, schuift 'ie OMHOOG mee met de content terwijl je omlaag scrolt (1:1, alsof 'ie op de pagina staat): `transform: translateY(-u)` op `.snake-move` (`script.js` sectie 7). Naadloos doorlopend want de **golf-periode is 100 in y** (= halve viewport) en de translate gaat modulo 100. `mask-image`-vervaging boven/onder laat 'm rond het midden "eindigen". Pauzeert vanzelf bij stilstand (scroll-gedreven), en staat stil bij `prefers-reduced-motion`. Tunebaar: amplitude via de control-x (nu 30/70, was 25/75), rondheid via de control-y-offset (nu ±14 rond elk anker)

## Copy / toon

- **Stem:** persoonlijk en zelfverzekerd, ik-vorm vanuit de oprichter. Hero-kop: "Jij onderneemt. De rest regel ik."
- **Geen em-dash (—)** in de teksten. Gebruik een komma, dubbele punt of een nieuwe zin
- **Energiemissie en klanten mogen niet herleidbaar zijn.** Diensten-voorbeelden generiek houden (geen energiesector-termen, geen klantnamen). Stacklines is een persoonlijk side-project, los van Energiemissie
- **Kerneigenschappen** kloppen met de werkwijze: uurbasis (geen vaste prijs), realistische aanpak (geen harde deadline-belofte), self-hosted in eigen omgeving

## Quirks / bewuste workarounds

- **Footer zit BINNEN `<section id="contact">`** (absolute aan de onderkant), niet onder `</main>`. Reden: als losse snap-target werd contact overgeslagen bij omhoog scrollen, of footer was helemaal niet bereikbaar bij `mandatory` snap. Niet terug-verplaatsen. (Op mobiel staat 'ie `position: static`, want daar is er geen full-height snap.)
- **"Terug naar boven"-link werkt via JS** (`window.scrollTo({top:0})`). Reden: `<a href="#top">` faalt omdat het target de sticky header is — browsers zien sticky elementen als "al in beeld" en scrollen niet
- **`will-change: opacity, transform`** op `.reveal` is bewust — voor smoother animaties op zwakkere devices
- **`scroll-snap-stop: always`** overal: voorkomt dat snel scrollen secties overslaat

## Placeholders nog in te vullen

In `index.html`:
- `[Jouw naam]` (regel ~355)
- `[X] jaar ervaring met procesautomatisering` (regel ~369)
- `KvK [nummer]` in mini-footer (regel ~452)
- Telefoonnummer `06 – 00 00 00 00` (regel ~410)
- E-mail `hallo@stacklines.nl` (regel ~406 én in `script.js` regel ~165)
- Social links wijzen naar `#` (regels ~419-421)

(Foto in "Over mij" is ingevuld: `inge.jpg`, via `.about-photo`. Regelnummers hierboven zijn bij benadering en kunnen na edits verschoven zijn.)

Nog te doen:
- Favicon ontbreekt (geen `<link rel="icon">`)
- `og:image` en `og:url` ontbreken in meta-tags — handig voor LinkedIn/WhatsApp sharing previews
- Custom domain koppelen in Cloudflare Workers settings

## Workflow vanaf de map

```
git add .
git commit -m "wat je veranderde"
git push
```

Cloudflare deployt automatisch. Geen pre-commit hooks, geen linter, geen tests.
