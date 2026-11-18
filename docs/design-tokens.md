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

Deliberate layout deviations from the BTV base (owner-requested, all in `src/app/brand.css`):

| Area | BTV | Manis Grafika | Round |
|---|---|---|---|
| Footer payment block (desktop) | flush right | `margin-right: 45px`, clears the fixed back-to-top pill | 264 |
| Footer contact links | link text only | label + 14px `#555` value (`.footer-link-note`, 13px <=480px); email breaks only before "@" | 268, 270 |
| Newsletter, stacked layout (<=798px) | description right-aligned; email field pulled 15px past the gutter | description left-aligned; field inside the page gutter | 270 |
| Policy draft notice | n/a | spans the 1000px text column, Recoleta 22px | 269 |
| PDP quantity + "Halaman Redaksi" (MG addition) | n/a | labels on the variant-legend metrics (Everett-Light 16px, -1px); 40px pill stepper; redaksi group under a 1px `#e6e6e6` divider; pill photo picker; textareas 1px `#cfcfcf`, radius 12px, teal focus | 273 |
| PDP block options (paper, page count) | 40px circles, padding 3px | pills: min-width 52px, height 40px, padding 0 18px, 1px `#d0d0d0`; selected 1px `#000` + 1px inset; unavailable dashed `#aaa` | 274 |
| PDP colour legend | value only | "Cover: <value>" | 274 |
| PDP price | compare-at same size as sale price; tax caption hidden | compare-at 18px; caption "Harga per pcs, belum termasuk ongkos kirim" shown (13px `#666`) | 274 |
| PDP info tabs | active fill `rgb(202,211,218)`, letter-spacing -1px | active `#000` fill, white text; 15px, no tracking; 14px / 7px 14px <=480px | 274 |
| PDP tab panels | source rich text | Everett-Light 15px/1.7 `#222`; `h3` 15px Everett-regular; lists with 6px teal dots | 274 |
| PDP "Cocok Dipadukan" | glued to the tabs; 28px desktop / 18px mobile | 36px gap + 28px padding above a 1px `#e6e6e6` divider; 22px heading | 274 |

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
