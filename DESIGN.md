---
name: Ohm Phongphat
description: A personal portfolio built around curiosity, real work, and a recognizable portrait.
colors:
  cobalt: "#1f2de6"
  cobalt-hover: "#1824bd"
  cool-paper: "#eef0f3"
  cool-surface: "#e2e5ea"
  ink: "#0b0c0e"
  muted: "#5d6470"
  body-secondary: "#454c58"
  line: "#cdd1d9"
  on-cobalt: "#ffffff"
  field: "#f8f9fb"
  field-line: "#aeb6c4"
  placeholder: "#657084"
  success: "#206349"
  warning: "#785109"
  error: "#b02b36"
  info: "#1d56a1"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(56px, 5.7vw, 82px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(36px, 4vw, 56px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Hanken Grotesk, Kanit, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
  label:
    fontFamily: "Hanken Grotesk, Kanit, sans-serif"
    fontSize: "14px"
    fontWeight: 500
rounded:
  field: "8px"
  item: "12px"
  image: "14px"
  panel: "16px"
spacing:
  compact: "8px"
  related: "16px"
  content: "24px"
  panel: "32px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
    rounded: "{rounded.field}"
    padding: "12px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 22px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "48px"
  tool-panel:
    backgroundColor: "{colors.cool-surface}"
    rounded: "{rounded.panel}"
    padding: "32px"
---

# Design System: Ohm Phongphat

## Overview

**Creative North Star: "A personal portrait and exploratory directory"**

Cool grey surfaces and confident cobalt regions frame a personal showcase. Expressive Newsreader headlines introduce the owner; Hanken Grotesk keeps navigation, Thai-supported forms, and working utilities clear. Real portraits, actual project images, and full-colour technology logos provide the identity.

**Key Characteristics:**

- Flat tonal surfaces and open, divided lists.
- Large serif headlines paired with practical sans-serif controls.
- Soft image frames and a signature portrait arch.
- Quiet interaction feedback with reduced-motion support.

## Colors

Primary: cobalt marks actions, active navigation, selected choices, headline emphasis, and large portrait/login regions. Cobalt-hover darkens primary buttons. On-cobalt supplies inverse text.

Neutral: cool-paper is the page ground; cool-surface groups panels and footer content. Ink, body-secondary, and muted establish reading hierarchy; body-secondary gives major descriptive paragraphs stronger contrast, while muted serves metadata. Line separates rows. Field and field-line distinguish editable controls. Success, warning, error, and info are semantic feedback colours; pair them with text or icons. The Christmas game retains its contextual green palette.

**The Real Colour Rule.** Keep technology logos in their original colours; the site palette does not recolour brand assets.

## Typography

Newsreader supplies display, section headings, statement text, and italic emphasis, with Georgia fallback. Hanken Grotesk supplies body and controls, with Kanit supporting Thai. Load these through `next/font/google` in the root layout; Kanit has `preload: false`. Utility output uses `ui-monospace, monospace` at (13px), with (1.8) line height.

The frontmatter display role describes the desktop home hero; below (900px), the intermediate hero size is (48px), before the mobile clamp takes over. The statement is a single `h2.mo-wh__text`, without a separate introductory label. The footer invitation uses `clamp(48px, 7.4vw, 106px)` and becomes (50px) on mobile. Internal page titles use `clamp(48px, 6vw, 80px)`; project titles use the sans face at (26px), weight (500). Body copy stays quieter than headlines; metadata uses (12-14px). Preserve Thai strings and the fallback font.

## Layout

The shared centred container is `min(1280px, calc(100% - 112px))`, with equal edges. It narrows to (64px) total gutters at (1100px), (40px) at (767px), and (32px) at (360px). Home and exploration use equal split columns with a (24px) gap and top-aligned desktop hero copy; screen sections use (80px) vertical padding and a (100svh) minimum, reducing padding to (64px) at (768-1100px). Internal public routes share the navigation, large page heading, content region, and full-screen footer with a (100svh) minimum. At (768-1023px), the home copy and portrait use a (650px) composition with vertically centred copy.

Projects and certificates use a two-column image grid; skills use grouped labels and logo tiles; contact uses open contact rows beside a portrait. Playground entries are divided horizontal rows. Utility forms use two-column panels capped at (1040px). Below (767px), these major layouts stack, page padding reduces, and project filters stretch across the available width. Skills retain two columns until (360px).

Navigation becomes a full-height menu below (767px), with (66px) link rows, scroll locking, Escape dismissal, and keyboard focus handling. Home text precedes the portrait; mobile hero actions stack at full width, and the portrait has a (240px) minimum height. Login changes from a split story/form layout to stacked sections. Admin tables retain their data density and horizontal overflow containers.

## Elevation & Depth

Public surfaces are flat: tonal regions, hairline dividers, image cropping, and scale establish depth. Buttons and dashboard cards have no box shadow; admin gradient and heavy shadow utility styles are neutralized. Focus outlines indicate interaction rather than elevation.

## Shapes

Controls use the field radius; tiles and output regions use the item radius; project images use the image radius; panels use the panel radius. The portrait arch has (180px) upper corners and (16px) lower corners, reducing to (100px) and (12px) on mobile. Circle buttons are reserved for compact menu/scroll actions. Tags use small (5px) corners and a fine outline.

## Components

- **Buttons:** solid cobalt primary and transparent outlined secondary; minimum (48px) height, compact controls (44px). Hover lifts (1px), active presses down (1px) and scales to (.985). Disabled controls halve opacity and suppress transforms.
- **Links and navigation:** underlines, cobalt current-page colour, and small arrow movement establish affordance. Keyboard focus has a cobalt (2px) outline with (4px) offset; the exploration feature uses an inset (-4px) offset. Preserve the skip link and current-page semantics.
- **Inputs and choices:** light field fill, fine border, visible labels, and (48px) minimum height. Focus uses cobalt border and (2px) outline with (2px) offset. Selected choices are cobalt with white text and `aria-pressed`; errors and copy feedback remain textual. Shared input placeholders, including the game field, use placeholder on field (4.74:1 contrast).
- **Project and certificate cards:** rounded image above open text, metadata, tags, and actions. Images use (16:10) frames. Keep loading, empty, failure, and retry states distinct; never manufacture portfolio records to fill a grid.
- **Home imagery:** the portrait declares intrinsic (720 x 960) dimensions and is positioned absolutely inside its arch. Below-fold logos load lazily. `FeaturedProjectVisual` fetches the existing projects API and shows the first usable project image, name, and year; missing data or image errors restore the typographic preview without inventing a project.
- **Tools:** grouped fieldsets beside lighter output panels; wrapping monospace output, copy status, and browser-generated results. Preserve functional controls and Thai help text.
- **Admin and login:** use the same palette and field/button styling; login has a cobalt story panel. Preserve authentication, uploads, tables, dialogs, and error/loading states.
- **Motion:** the home heading reveals over (.85s); image hover scales to (1.025), buttons transition over (.16s), and links over (.2s). The root layout also loads `/assets/motion/motion.css`; its motion tokens govern the shared interaction layer, and route-mounted moments supplement it. `prefers-reduced-motion: reduce` disables animations/transitions and smooth scrolling and restores the heading without clipping.

Visual evidence: `.impeccable/review` contains twenty desktop/mobile screenshots covering public routes and login, including recaptured home and game images after review corrections. These establish visual review coverage; runtime interactions and authenticated admin behavior are not claimed as verified.

## Do's and Don'ts

- Do use the shared equal-edge container and responsive stacking rules.
- Do retain real portraits, project imagery, full-colour logos, Thai support, and visible keyboard focus.
- Do preserve truthful loading, empty, error, disabled, and success states.
- Don't introduce frosted glass, decorative shadows, or gradients into the flat public system.
- Don't replace Newsreader and Hanken Grotesk with the previous SF Pro identity.
- Don't static-export the application; authenticated dashboards and existing API routes require the Next.js server runtime.
