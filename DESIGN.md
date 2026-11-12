---
name: Koverr
description: Exposure is black and white. Colour returns when a leak is fixed.
colors:
  ground: "#0f0f0e"
  card: "#181917"
  raised: "#242623"
  text: "#f3f3ed"
  text-muted: "#c6c8be"
  ink-dim: "#8f918a"
  exposure-0: "#2e302d"
  exposure-1: "#484a45"
  exposure-2: "#6a6c65"
  exposure-3: "#a2a49b"
  exposure-4: "#e6e6de"
  fix: "#4be38a"
  fix-hover: "#7ff0ae"
  fix-ink: "#05210f"
  fix-deep: "#0f6b36"
  fix-wash: "#bdf1d2"
  bone: "#ecece6"
  bone-ink: "#191a18"
  bone-muted: "#46483f"
  bone-panel: "#dcddd5"
  bone-line: "#d3d4cb"
  launch-wash: "#c4f7da"
  launch-deep: "#3fcc79"
  launch-ink: "#0b3a1c"
typography:
  display:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "clamp(2.05rem, 8.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "clamp(2.4rem, 4.6vw, 4.2rem)"
    fontWeight: 800
    lineHeight: 0.99
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.004em"
  label:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.45
rounded:
  control: "2px"
  none: "0"
spacing:
  section: "clamp(88px, 11vw, 168px)"
  run: "clamp(56px, 7vw, 104px)"
  gutter: "clamp(20px, 5.3vw, 80px)"
components:
  button-primary:
    backgroundColor: "{colors.fix}"
    textColor: "{colors.fix-ink}"
    rounded: "{rounded.control}"
    padding: "12px 15px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.fix-hover}"
  input-email:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    height: "56px"
  chip:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.fix}"
    textColor: "{colors.fix-ink}"
  market-tile:
    backgroundColor: "{colors.exposure-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
  hero-record:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
  leak-record:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.bone-ink}"
    rounded: "{rounded.control}"
---

# Design System: Koverr

## Overview

**Creative North Star: "The Colour Returns"**

Personal data is traded, and the person it describes carries the cost. Koverr shows that in black and white: every leak, every breach, every source of exposure is a grey. Colour is what a person gets back. A leak that has been found, requested, answered and checked turns green, and nothing else on the page is allowed to.

The page is a near-black market floor with one bone-coloured table and one full green field at the close. Data is the interface: a treemap of real breach records, greyscale photographs of an exchange floor, a dated leak record that changes colour as it is closed. There is no illustration. The look is calm and exact, closer to a ledger than a security dashboard, because the reader arrives worried and needs to feel that someone is keeping the record.

**Key Characteristics:**
- Greyscale for exposure, a single green for fixed and for the main action.
- Heavy, compact display type over quiet, generous body type.
- Flat fills separated by tone and space. No shadows, no gradients, no borders doing the work of spacing.
- Real, sourced figures or clearly labelled fictional ones.
- One authored motion: colour returning to a record as it is fixed.

## Colors

A neutral near-black ground with a stepped grey ramp for exposure, one green, and one bone surface for reading.

### Primary
- **Fix Green** (#4be38a): the fixed state and the main action. Fixed rows in a record, the primary button, the selected chip, the closing signup field, focus rings on dark.
- **Fix Hover** (#7ff0ae): hover on the primary button and header call to action.
- **Fix Ink** (#05210f): text on Fix Green.
- **Fix Deep** (#0f6b36): green text and icons on bone, where Fix Green would not reach contrast.
- **Fix Wash** (#bdf1d2): the tint behind the "The fix" column in the six-ways table.

### Neutral
- **Market Ground** (#0f0f0e): the page.
- **Card** (#181917) and **Raised** (#242623): the two steps above ground for panels, inputs, selected rows and open FAQ items.
- **Warm White** (#f3f3ed): primary text on dark. **Muted Stone** (#c6c8be): secondary text and metadata. **Dim Ash** (#8f918a): rows not yet reached in a record.
- **Exposure ramp** (#2e302d, #484a45, #6a6c65, #a2a49b, #e6e6de): the five steps of exposure. Brighter and higher contrast means more sensitive data. Tile text flips to near-black from the fourth step.
- **Bone** (#ecece6), **Bone Ink** (#191a18), **Bone Muted** (#46483f): the light reading surface for the six-ways table and the sample record. **Bone Panel** (#dcddd5) and **Bone Line** (#d3d4cb) separate rows.
- **Launch tints** (#c4f7da, #3fcc79, #0b3a1c): the input, follow-up panel and text on the green closing field.

### Named Rules
**The Colour Returns Rule.** A leak is grey until it is fixed. No hue marks risk, loss or alarm. Colour is only ever the answer.

**The One Green Rule.** There is one chromatic colour. It appears on a fixed item or on the action that fixes it, and on the closing field. If something green is not a fix or an action, remove it.

**The Shade Not Hue Rule.** Differences in exposure are shown by lightness, never by colour. Whoever relies on colour alone loses the meaning, so every shade also has a label.

## Typography

**Display, headline, body and label:** Archivo (with Arial). One family, five roles.

**Character:** Heavy and compact at the top, plain and open underneath. The weight contrast does the hierarchy; there is no second face.

### Hierarchy
- **Display** (800, clamp(2.05rem, 8.4vw, 6rem), 0.95, -0.04em): the home headline only.
- **Headline** (800, clamp(2.4rem, 4.6vw, 4.2rem), 0.99, -0.04em): section titles.
- **Title** (700, 1.5rem, 1.12, -0.025em): card titles, ledger headings, table row names, the leak record title.
- **Body** (400, 1rem, 1.6, +0.004em): prose, kept to 65 to 75 characters. Light text on dark gets slightly more leading and tracking than on bone, where tracking returns to 0.
- **Label** (600, 0.9375rem): form labels, table headers, definition terms. Nothing on the page is under 14px.

- **Exceptions:** the leak-map chart labels and centre figure (SVG text, 11 to 34px, scaled up on phones) and the footer wordmark (clamp(5rem, 24vw, 22rem), decorative, hidden from assistive tech).

### Named Rules
**The Tabular Figures Rule.** Counts, dates and amounts use tabular numerals so columns and tickers line up.

**The Weight Does The Work Rule.** Hierarchy comes from weight and size. Do not add a second typeface, uppercase eyebrows or tracking tricks.

## Layout

A 1280px measure with a fluid gutter. The home page runs: headline, then the form beside the leak record in the first viewport, one breaches map with its ledger, the six ways out as a table on bone, a short "who picks it up" section with two greyscale photographs, the full sample record, the FAQ, and the green close.

Spacing has two intervals. A major break (88 to 168px) sits next to the bone and green fields. A shorter run (56 to 104px) separates dark sections from each other, where the tone change already marks the edge. Below 1050px the hero and sections stack into one column. Below 900px the header drops its links. On a phone the treemap becomes a ranked list, largest first, with the selected item's detail opening inline.

## Elevation & Depth

Tonal layering only. Depth is ground, card, raised, with bone as a separate light surface. There are no shadows and no gradients. A selected item gets a 3px white outline, not a lift.

## Shapes

Square by default. Tiles, list rows and tables have no radius. Controls, chips and the two record cards have a 2px corner. Rows and tiles are separated by 3px gaps of ground colour, not lines.

## Components

### Buttons
- **Shape:** 2px corner, 56px tall in forms.
- **Primary:** Fix Green with Fix Ink text, bold, with an arrow that moves 4px on hover. Hover brightens to Fix Hover, press scales to 0.98.
- **Replay and skip:** plain underlined text, 44px minimum target.

### Chips
- **Style:** Raised background, Warm White text, 2px corner, 44px tall.
- **Selected:** Fix Green with Fix Ink text.

### Inputs / Fields
- **Style:** Card background, no border, 2px corner, 56px tall, Fix Green caret.
- **Focus:** a 3px Fix Green outline offset 3px; on bone surfaces the outline is Bone Ink.

### Market map
- **Treemap tiles:** square, sized by real counts, filled from the exposure ramp, labelled with the name, a plain-language line on large tiles, and the figure. Selected tile has a white outline.
- **Ranked list (phones):** each row is a 64px target with name, figure, a plain-language line and a grey bar scaled to the largest source. Selecting opens the ledger beneath the row.
- **Ledger:** "who can use it" and "what it can cost you" on ground-coloured panels. Both are text, no colour.

### Leak record
- **Hero record:** a card on dark. It starts grey and "Exposed". As each step lands, a tinted band wipes across the row and its text turns Fix Green; the visible address is replaced by "Not on the page". A Replay button restarts it. Reduced motion shows the finished state.
- **Sample record:** the same idea on bone, with Fix Deep. It colours row by row the first time it is read, and stays finished with reduced motion or without script. It carries the blurred address a visitor can reveal.

### Six ways out
A real table that stacks into labelled blocks on phones. The gain and cost columns share one grey; only the fix column carries Fix Wash.

### Photographs
Two archival exchange-floor photographs, always greyscale, always captioned with their credit. Colour is never added to a photograph.

## Do's and Don'ts

### Do:
- **Do** show exposure in grey and fixes in green (#4be38a), and let the only colour on a record be the part that has been dealt with.
- **Do** separate surfaces with tone and 3px gaps.
- **Do** pair every shade with a label or a figure.
- **Do** keep copy honest: sourced figures or labelled fictional data, never guaranteed removals.
- **Do** keep motion to colour returning, and give it a reduced-motion state that shows the finished result.

### Don't:
- **Don't** use red, coral or amber for risk or loss. Risk is grey.
- **Don't** use green for anything that is not a fix or the action to fix.
- **Don't** add illustration, cartoon characters or decorative graphics.
- **Don't** add shadows, gradients, glass or border-left accent stripes.
- **Don't** stage sections with scroll fades, or animate tiles in.
- **Don't** set type under 14px or introduce a second typeface without a role Archivo cannot perform.
