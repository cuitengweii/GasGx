# Storyboard

**Format:** 1920x1080  
**Audio:** Kokoro TTS voiceover. No separate music bed in this first preview pass.  
**VO direction:** Calm, confident industrial product narration with short pauses between proof points.  
**Style basis:** DESIGN.md, captured GasGx page colors, Inter typography, dark product UI panels, neon green technical accents.

## Asset Audit

| Asset | Type | Assign to Beat | Role |
| --- | --- | --- | --- |
| `gasgx-g300-generator-set-exterior.png` | Product hero image | Beats 1, 2, 4 | Signature generator visual, framed and slowly pushed in |
| `gasgx-g300-image-1.png` | Blueprint diagram | Beat 3 | Technical drawing layer |
| `gasgx-g300-image-2.png` | Blueprint diagram | Beat 3 | Secondary engineering view |
| `gasgx-g300-image-4.png` | System diagram | Beat 3 | Gas control system proof layer |
| `gasgx-g300-image-5.png` | System diagram | Beat 4 | Delivery/customization technical backdrop |
| `gasgx-g300-image-6.png` | Wiring diagram | Beat 3 | Fine-detail engineering texture |
| `gasgx-g300-image-7.png` | Maintenance diagram | Skip | Useful but red-heavy and less aligned with CTA |
| `leroy-somer-logo.png` | Partner logo | Beat 2 | Alternator proof |
| `logo-e22767fb.svg` | Partner logo | Beat 2 | Cummins proof |
| `logo-c35df193.svg` | Partner logo | Beat 2 | ComAp proof |

## Beat 1 - Hook: Site-Ready Power (0.00-4.20s)

**VO cue:** "Stranded gas becomes site-ready power."

**Concept:** The video opens inside a dark industrial control environment already alive with green diagnostic light. The generator exterior dominates the frame while a large kinetic claim locks into place, making the product feel like a practical answer to remote energy waste.

**Visual description:** Full-frame dark canvas with the G300 exterior image anchored across the lower half, slowly pushing forward. A ghosted grid and thin green diagnostic lines draw over the background. The GasGx wordmark and `G300` assemble in the upper left; `SITE-READY POWER` lands as a bold proof phrase. A small pill reads `OPEN-FRAME STANDALONE GENERATOR SET`. Green pulses travel along a drawn connector path from the text to the generator.

**Techniques:** Per-word kinetic typography, SVG path drawing, procedural grid glow.

**Assets:** `capture/assets/gasgx-g300-generator-set-exterior.png`

**Transition:** Velocity-matched upward blur into Beat 2.

**Depth layers:** BG radial glows and grid, MG oversized product image, FG title, proof pill, animated trace.

**SFX cue:** Low industrial hit on title lock; small electrical tick on path draw.

## Beat 2 - Product Proof: Three Numbers (4.00-9.50s)

**VO cue:** "GasGx G300 delivers three hundred kilowatts from a Cummins fifteen N core engine, with thirty seven percent electrical efficiency in a compact open-frame generator set."

**Concept:** The viewer moves from the emotional hook into hard product proof. Three metric cards count up as the generator photo floats behind them, while supplier logos validate the core system.

**Visual description:** A dark dashboard surface rotates subtly in perspective. Three stat cards cascade in: `300KW`, `37%`, and `CUMMINS-15N`. The product image sits in a framed window on the right with a slow Ken Burns push. Along the bottom, Leroy-Somer, Cummins, and ComAp logo tiles slide in as a compact supply-chain strip. Green scan bars sweep across each stat as the VO reaches the number.

**Techniques:** Counter animation, CSS 3D card staging, shimmer sweep.

**Assets:** `gasgx-g300-generator-set-exterior.png`, `leroy-somer-logo.png`, `logo-e22767fb.svg`, `logo-c35df193.svg`

**Transition:** Whip pan left into Beat 3.

**Depth layers:** BG dashboard grid, MG stat cards and framed product image, FG animated number glints and logo strip.

**SFX cue:** Soft counter clicks for each metric; short scan sweep on logo strip.

## Beat 3 - Engineering Scope: Built Together (9.30-15.20s)

**VO cue:** "It brings the essentials together: Leroy-Somer alternator, ComAp controller, eight thousand hour warranty time, and a deployable factory scope for oilfield, industrial, and gas-to-computing projects."

**Concept:** The promo becomes a technical assembly map. Blueprint panels slide into a layered command wall while a checklist confirms this is more than an engine: it is a configured power package.

**Visual description:** Four blueprint images overlap in a staggered wall with parallax drift. A central checklist builds line by line: alternator, controller, warranty time, factory scope. Thin green paths draw between blueprint panels and the checklist. A large `8000h` warranty readout counts up and glows. Use cases appear as small location chips: `Oilfield`, `Industrial`, `Gas-to-computing`.

**Techniques:** Blueprint image parallax, SVG connector drawing, type-on checklist.

**Assets:** `gasgx-g300-image-1.png`, `gasgx-g300-image-2.png`, `gasgx-g300-image-4.png`, `gasgx-g300-image-6.png`

**Transition:** Blur-through with green wipe into Beat 4.

**Depth layers:** BG faint blueprint wall, MG checklist and warranty card, FG animated connector paths and use-case chips.

**SFX cue:** Mechanical ticks as checklist items resolve; soft glow swell on `8000h`.

## Beat 4 - CTA: Configure the Package (15.00-20.00s)

**VO cue:** "Start with the thirty six thousand eight hundred dollar base configuration, then customize the package with GasGx technical support."

**Concept:** The final scene converts proof into action. The price becomes the anchor, the generator returns as the visual guarantee, and the support CTA is clear without feeling like a generic sales button.

**Visual description:** A quote card expands from the center with `36800$` counting into place and `Base configuration price` below it. The generator image sits wide and slightly dimmed behind the card; the gas supply diagram appears as a low-opacity technical texture. Standard factory configuration and optional modules sit as two compact columns. The final CTA button `Request custom quote` glows in `#5DD62C`, with `GasGx G300` locked above it.

**Techniques:** Counter animation, foreground CTA glow, layered image compositing.

**Assets:** `gasgx-g300-generator-set-exterior.png`, `gasgx-g300-image-5.png`

**Transition:** Final fade to dark in the last 0.5s.

**Depth layers:** BG product image and system diagram, MG quote/delivery cards, FG CTA button and GasGx G300 mark.

**SFX cue:** Confident low hit on price reveal; clean green chime on CTA.

## Production Architecture

```text
project/
├── index.html
├── DESIGN.md
├── SCRIPT.md
├── STORYBOARD.md
├── transcript.json
├── narration.wav
├── narration.txt
├── capture/
└── compositions/
    ├── beat-1-hook.html
    ├── beat-2-proof.html
    ├── beat-3-engineering.html
    └── beat-4-cta.html
```
