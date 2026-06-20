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
- **Hero-visual = de postvak-assistent-demo** (rechterkolom, sinds 2026-06-20). De hero is nu twee kolommen: tekst links, een vanilla chat-mockup rechts die een mailvraag typt, "denkt" en de gevonden mail toont (`.sl-assistant`, markup in hero, styling in style.css onder "Postvak-assistent", gedrag in script.js sectie 8). Eigen `--sl-*` tokens gescoped op `.sl-assistant`, palet matcht de site, font erft Inter. Twee-koloms breekpunt staat bewust op **901px** (= waar scroll-snap aangaat) zodat er geen tussenzone is waar de hero gestapeld binnen 100vh afsnijdt. Op mobiel (≤900px) stapelt de demo gecentreerd onder de tekst. *Historie:* eerder was de hero bewust minimaal (alleen tekst + slingers); een uitgebreide workflow/n8n-tekening was geprobeerd en verwijderd (te druk). De assistent-demo is na overleg met de user toegevoegd omdat 'ie inhoudelijk (mail zoeken/samenvatten) precies het AI-verhaal toont. Op mobiel komt i.p.v. de slingers een aparte "slang" terug (zie sectie Mobiel)
- **Hover op cards/steps**: `0.25s`, lift `6px`, icon-rotate `6°`. Geen "wiebelige" 8px+ meer

## Mobiel (≤900px)

- **Geen scroll-snap, geen full-height secties.** `html { scroll-snap-type: none }`, `.hero`/`.section` worden `display: block` met `min-height: auto`. Reden: met `mandatory` snap werd content die hoger is dan het scherm onbereikbaar en schokkerig
- **Footer terug in de flow** (`position: static`) i.p.v. absoluut onderaan een 100vh-sectie
- **Achtergrond-slingers (`.hero-wave`/`.section-wave`) verborgen**: die werden lelijk samengedrukt door `preserveAspectRatio="none"` op smal scherm. De vignette-gloed van `body::before` blijft als achtergrond
- **Tegels kleiner**: minder padding op `.card`/`.step` (≤720px)
- **Hamburger-menu**:
  - Hamburger morpht naar een kruisje en terug, via `aria-expanded` op `.nav-toggle` (CSS-transities op de drie `span`s)
  - Menu is een **frosted (blur) overlay** die de pagina niet omlaag duwt (`position: absolute` onder de balk). Het **faded** in/uit (alleen opacity, géén transform/translate). Een geblurde laag verplaatsen hapert, want de browser moet dan elke frame opnieuw blurren
  - De header-balk wordt **solide** zodra het menu open is (`.site-header:has(.mobile-nav.open)`), anders schijnt content door de transparante/frosted balk. Geef de balk dan géén `backdrop-filter`, want geneste backdrop-filters heffen de menu-blur op
- **Slang op de achtergrond (WIP, `.bg-snake` + `.snake-move`/`.snake-line`)**: doorgetrokken golvende lijn die op het scherm 1:1 met de scroll omlaag zakt (`transform: translateY` op `.snake-move`, in `script.js` sectie 7), naadloos doorlopend (golf-periode = halve viewport), met een `mask-image`-vervaging boven/onder zodat 'ie rond het midden "eindigt". Kleur ademt via `snakeBreathe1`, pauzeert vanzelf bij stilstand (scroll-gedreven). **Nog in afstemming**: de gewenste beweging is een paar keer omgegooid (kop vast op schermmidden vs. 1:1 omlaag zakken). Huidige stand = 1:1 omlaag. Snelheid, bochten (`25`/`75`) en vervaging (`mask-image`) zijn tunebaar

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
