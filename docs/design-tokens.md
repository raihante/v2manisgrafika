# Design Tokens

## Manis Grafika brand layer (owner decision 2026-11-16, round 264 shell pass 2026-11-17)

Source: `src/app/brand.css` (overrides only; the generated BTV source CSS stays untouched). Layout, spacing, typography
(Everett) and geometry below remain the BTV measurements.

| Token | Value | Use |
|---|---|---|
| `--mg-teal` | `#2b5865` (sampled from the Manis Grafika logo) | Primary buttons, add-to-cart, active links (except the hero title), header link hover, hamburger drawer background, header search glyph, labels, checkout accents (replaces BTV blue `#0060d4`) |
| `--mg-teal-dark` | `#1f444e` | Button hover, newsletter background, "new" label (replaces BTV navy `#002ea1`) |
| `--mg-teal-light` | `#9fd0d8` | Active homepage hero title on the dark Instagram photos (contrast 9.7:1 on #2a1d14; `--mg-teal` was 2.1:1). Owner-approved 2026-11-17 |
| `--mg-pink` | `#cc3366` (manisgrafika.id accent) | Sale price, discount labels, wishlist heart in the drawer, promo popup button |
| Logo | `manis-grafika-logo-teal.png` 744x225 at the BTV logo height (34px desktop / 24px mobile) | Header width is 112px desktop / 79px mobile (BTV logo was 312 / 220) |

Everything else keeps the BTV black/white theme.

# BTV source measurements (layout base)

Measured from the source Shopify CSS and runtime geometry on 2026-11-03.

## Typography and Color

- Body: Everett Regular, `#151515` on `#ffffff`.
- Medium labels/headings: Everett Medium.
- Social display heading: Recoleta Regular.
- Borders: `#e2e2e2`.
- Desktop content padding: `50px`; mobile content padding: `15px`.
- Primary transition curve: `cubic-bezier(.104,.204,.492,1)`.

## Source Geometry

| Section | Desktop height | Mobile height at 390px |
|---|---:|---:|
| Announcement | 41px | 30px |
| Header | 80px | 69px |
| Category hero | 957px | 452px |
| Promotion slideshow | 1175px | 1175px |
| Each product rail | 805px | 612px |
| Social heading + feed | 452px | 358px |
| Newsletter | 345px | 263px |
| Footer | 438px | 627px |

Desktop reference viewport is `1920x955`; mobile reference viewport is `390x844`.
