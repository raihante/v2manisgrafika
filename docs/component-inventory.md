# Component Inventory

## Homepage Sprint

- Announcement bar with source-matching message and height.
- Sticky header with desktop and mobile navigation states.
- Featured collection/category slider.
- Primary promotional slideshow.
- Reusable product rail for New In, BTV Bags, and Your Favourites.
- Product card with source-derived colour swatches, active/sold-out states, hover secondary-image transition, variant-image selection, labels, pricing, and mock actions.
- BTVON YOU social heading and Instagram feed.
- Newsletter form with non-transactional frontend behavior.
- Responsive footer and link groups.
- Cart, search, account, and menu overlays required by homepage navigation.

Component details, variants, and breakpoint behavior remain pending deeper DOM/CSS inspection.

## Content blocks (round 258, own design, not source-faithful)

Template for the Shogun page-builder routes (AGENTS.md "CMS-template scope reduction"): `/pages/about-us`, `/pages/terms-of-service`, `/pages/privacy-policy`, `/pages/returns`, `/pages/shipping-rate`; later the 21 Shogun articles. Code: `src/components/pages/ContentPage.tsx`, `src/app/pages/[slug]/{page.tsx,content-page.css}`, repository `src/lib/pages/content.ts` (`ContentPageData`, `ContentBlock`), fixtures `src/data/pages/content/<slug>.json` from `scripts/build-content-pages.mjs`. Status: **approximate / not visually verified** (owner screenshot review pending).

| Block | Props | Rendering | Source mapping (builder) |
|---|---|---|---|
| Hero title band | `heroTitle[]`, `accent` | `<h1>` lines, Everett Medium, white on the page accent | Shogun text >= 150px (terms, privacy) |
| Hero artwork | `hero.image`, `fit`, `maxWidth`, `height`, `mobileHeight` | `<img>` with object-fit; `<h1>` visually hidden | Leading background-image box without an inner `<img>` (returns, shipping-rate) |
| `heading` | `html` (plain text), `align` | `<h2>` Everett Medium in the accent colour | Everett Medium text 40-150px |
| `richText` | `html` (p, a, strong/b, em/i, u, br), `variant` body/lead/note | `.content-rte` | Other text; >= 24px -> lead; rgb(183,183,183) -> note; consecutive paragraphs merge |
| `image` | `image`, `mobile?`, `background?`, `mobileBackground?`, `href?`, `maxWidth?` | `<figure>` with `<picture>` (mobile source at max-width 767px), optional backdrop | `<img>`; a background box around an `<img>` becomes the backdrop (about-us) |
| `imageGrid` | `items[]` | CSS grid | Not used by the 5 pages yet |
| `button` | `label`, `href` | Pill link in the accent colour | Not used yet |
| `video` | `src`, `poster?` | `<video controls>` | Not used yet |
| `iconList` | `variant` steps/bullets, `items[{icon,title?,html}]` | `<ol>`; steps joined by a dotted CSS connector | Shogun row: image column + text column (returns steps, shipping bullets); a leading connector image in the column is dropped |
| `list` | `ordered`, `items[]` (html) | `<ol>/<ul>` | Rows whose first column is a 1-3 character number |
| `callout` | `title`, `html` | Large figure + Recoleta label on the accent | Rows whose first column holds a >= 80px figure |

Responsive tier: one breakpoint at 767px (source Shogun breakpoint for these pages). Desktop-only / mobile-only duplicate copy on the source is collapsed to the desktop copy; hidden-on-both source content (returns second option card) is not mapped.
