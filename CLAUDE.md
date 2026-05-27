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
- **Vignette-achtergronden** voor alle secties behalve contact: hero-stijl `radial-gradient` met variërende ankerpunten zodat ze familie zijn maar ademen. Contact = espresso via `.section-dark`
- **Scroll-snap `y mandatory`** op `html`, secties hebben `snap-align: start` + `snap-stop: always`. Instagram-reels-achtig gedrag is opzettelijk
- **Reveal-animaties**: `0.55s`, easing `cubic-bezier(.2,.7,.2,1)`, translate `14px`. Korte stagger op cards/steps (`.10s` per child). Niet langer maken — was bewust strakker gemaakt
- **Slinger-paden** (SVG `.section-wave` en `.hero-wave`):
  - Tekenen zich bij in-view, **ont-tekenen** bij wegscrollen (script.js toggle, niet `unobserve`)
  - Pulseren in tegenfase (`6s` loop, negatieve `animation-delay` voor phase shift). Hero heeft 3 lijnen die om de 2s opvolgend pieken
  - Deinen daarnaast heel subtiel op en neer (`floatY`, ±5px, 8s, per lijn een andere fase). Tunebaar bij `@keyframes floatY`
- **Hero-visual is bewust minimaal**: alleen tekst links plus de achtergrond-slingers, geen apart grafisch object rechts. Een uitgebreide workflow/n8n-tekening is geprobeerd en weer verwijderd (voelde te druk naast de zachte rest). Niet opnieuw toevoegen zonder overleg
- **Hover op cards/steps**: `0.25s`, lift `6px`, icon-rotate `6°`. Geen "wiebelige" 8px+ meer

## Copy / toon

- **Stem:** persoonlijk en zelfverzekerd, ik-vorm vanuit de oprichter. Hero-kop: "Jij onderneemt. De rest regel ik."
- **Geen em-dash (—)** in de teksten. Gebruik een komma, dubbele punt of een nieuwe zin
- **Energiemissie en klanten mogen niet herleidbaar zijn.** Diensten-voorbeelden generiek houden (geen energiesector-termen, geen klantnamen). Stacklines is een persoonlijk side-project, los van Energiemissie
- **Kerneigenschappen** kloppen met de werkwijze: uurbasis (geen vaste prijs), realistische aanpak (geen harde deadline-belofte), self-hosted in eigen omgeving

## Quirks / bewuste workarounds

- **Footer zit BINNEN `<section id="contact">`** (absolute aan de onderkant), niet onder `</main>`. Reden: als losse snap-target werd contact overgeslagen bij omhoog scrollen, of footer was helemaal niet bereikbaar bij `mandatory` snap. Niet terug-verplaatsen
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
