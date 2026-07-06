---
name: project-stacklines
description: Stacklines is een persoonlijke side-onderneming van de user (automatisering voor MKB/ZZP in Apeldoorn). Statische landingspagina gehost op Cloudflare Workers via GitHub.
metadata: 
  node_type: memory
  type: project
  originSessionId: 38ded221-3dd9-4e8b-a43f-6fa6b5711066
---

Stacklines is een **persoonlijke / side-onderneming** van de user — niet Energiemissie-werk. Automatiseringsbedrijf voor MKB en ZZP in Apeldoorn (Make/Zapier/n8n-werk, AI-integraties).

## Lokatie en bestanden
- Lokale map: `C:\Users\Gebruiker\Documents\Stacklines\`
- 3 bestanden: `index.html`, `style.css`, `script.js` (vanilla, geen build-tools)
- Project-specifieke `CLAUDE.md` ligt in de map — lees die eerst als je in deze map werkt, hij beschrijft designconventies, quirks en open todos

## Deploy-keten
- GitHub: `ingesluis1/Stacklines` (private)
- Cloudflare Workers gekoppeld aan repo → auto-deploy op `git push` naar main
- Live URL: `stacklines.ingesluis1.workers.dev`
- Custom domain `stacklines.nl` (nameservers staan al goed bij mijndomein → Cloudflare), **nog niet gekoppeld** in Workers settings — eerste de site afmaken

## Status (per 2026-06-20)
- Custom domain `stacklines.nl` is **gekoppeld en live** (HTTP 200 op root + /sitemap.xml)
- Hero heeft nu een postvak-assistent-chatdemo (rechterkolom); details in de project-CLAUDE.md
- SEO-basis toegevoegd en gepusht: `sitemap.xml` + `robots.txt` (verwijst naar stacklines.nl), `canonical` + `og:url` in index.html
- Sitemap `https://stacklines.nl/sitemap.xml` ingediend in Google Search Console (Domein-property)

## Update 2026-06-29 (grote mobiele overhaul + content)
- **Mobiele achtergrond-slang**: na veel iteratie nu scroll-driven CSS-animatie op een HTML-`<svg>` met 3D-transform (eigen GPU-laag) → strak meelopen, geen lag/schokken. Details in project-CLAUDE.md.
- **Flow-rail = mobiele navigatie**: op <1440px rechts, alleen bolletjes; label verschijnt bij ingedrukt houden, slepen langs de rail "scrubt" (scrollt live mee). Huisje-idee weer vervangen door gewoon "naar boven"-bolletje. Hamburger-menu volledig verwijderd.
- **Ingekort voor mobiel**: strakkere witruimte, gecondenseerde teksten, quote-blok verborgen op mobiel, diensten- én proces-kaarten als horizontale swipe-carrousel (pijltjes + dots in hero-demo-stijl, `initTrackCarousel`).
- **Copy ingevuld**: naam **Inge van der Sluis**, "Over mij"-verhaal (ik-vorm), prijsboodschap overal **uurbasis** (was deels "vaste prijs"), e-mail **ingevandersluis@stacklines.nl** (ook in contactformulier-script), LinkedIn-link (GitHub/X verwijderd). "Over mij"-foto klikbaar → contact; op mobiel onder de tekst.
- **Nog open**: telefoonnummer (Inge moet nog nummer regelen) + KvK-nummer (bewust placeholder), favicon, og:image. **Let op:** mailbox `ingevandersluis@stacklines.nl` moet echt bestaan/ontvangen worden (contactformulier + mailto sturen daarheen).

## TODO (SEO / vindbaarheid)
- **Backlinks regelen** voor stacklines.nl (LinkedIn-profiel/bedrijfspagina, KvK-vermelding) om ranking op zoektermen te helpen
- **Google Bedrijfsprofiel** aanmaken (gratis, sterk voor lokaal "Apeldoorn"-zoeken)
- User gaat hier zelf nog even naar kijken (genoteerd 2026-06-20)

## SkillTree-relevantie
Dit project valt **niet** onder de Energiemissie SkillTree (zie [feedback-skilltree-moneybird](feedback_skilltree_moneybird.md) voor vergelijkbare uitzondering — persoonlijke / side-projecten zijn geen team-skills).
