# Repository Guidelines

## Mission

Reconstruct `https://beyondthevines.co.id/` as a frontend-only, visually exact, responsive website. Match observable layout, content structure, interactions, routes, and behavior at every discovered viewport. The immediate priority is fidelity, not performance optimization. Use the globally installed `clone-website` skill as the primary cloning workflow; do not substitute Playwright, generic browser automation, or screenshot-only estimation. Work only with content and assets the project is authorized to reproduce. Do not bypass authentication, access controls, CAPTCHAs, or payment safeguards.

`ego-browser` remains the primary runtime for all discovery, capture, measurement, and comparison. REA (`morluto/rea`) is additionally permitted, but only as a supplementary browser-observation lane, and only when ego-browser cannot produce the required evidence. Documented reason for admission: ego-browser `Page.captureScreenshot` fails with `CdpRequestTimeoutError` on this machine, so the screenshot-based visual gate cannot currently be satisfied by ego-browser alone.

Constraints on any REA use in this project:

- The owner authorized this change on 2026-11-03. Re-verify that authorization before relying on REA in a later session.
- REA requires Node.js `>=22.23.4` on the 22.x line. This machine runs Node `v22.16.0`, which is below that floor, so REA is currently not installable without a Node upgrade.
- REA is an MCP server registered with the agent (`npx rea-agents setup`) and requires an agent restart; it cannot be invoked as an in-session probe.
- REA must never replace an ego-browser measurement that already works. Live DOM geometry and computed styles from ego-browser remain the priority-1 evidence source.
- REA must not be used to run destructive or transactional actions against the source site. Existing prohibitions on submitting orders or contact forms still apply.
- Record every REA-derived artifact in `reference/` and note in `SESSION_HANDOFF.md` which evidence came from REA rather than ego-browser.

The project owner has confirmed authorization to reproduce the required design, content, fonts, images, and assets for this project.

## Locked Scope and Stack

The rebuild method is locked (owner decision 2026-11-06, after the product-page pilot recorded in `SESSION_HANDOFF.md` round 253): **component rebuild**. Every route is built from Next.js/TypeScript components with the project's own CSS, written from measured source values (ego-browser rect and computed-style probes), and fed by typed repositories over source-derived fixtures. The owner's priorities are CMS readiness and clean code over raw pixel speed. Captured source HTML, theme CSS, and theme JS are reference evidence in `reference/`; render pages from components and data instead of injecting them. Copy exact source assets, SVGs, keyframes, and token values into components and CSS where the source has them. Preserve the source's DOM mounting strategy and container hierarchy, including hidden-but-mounted DOM such as mega-menus, lazy panels, and carousel cells, because the benchmark counts it. Any later shared-hosting constraint must be handled without weakening fidelity.

Store product, navigation, editorial, and page data behind typed repository/service interfaces, initially backed by local fixtures. UI components must not import fixture files directly. This boundary must allow a future CMS adapter to replace fixtures without redesigning components.

This phase covers every discoverable frontend route and state. Authentication, inventory, checkout, payment, form delivery, search, wishlist, cart, and other backend-dependent operations must use clearly identified non-transactional mock behavior. Do not create a real order or submit data to the source website.

Maintain `docs/mock-behaviors.md` as a migration ledger containing the feature, current fake behavior, storage used, affected components, intended CMS/API replacement, and migration status. Whenever CMS work begins, explicitly warn that these mock behaviors still exist and must be replaced; never allow a mock to be mistaken for a production integration.

## Required Repository Layout

- `src/`: application code, organized by feature or route.
- `public/assets/`: approved images, fonts, icons, and media.
- `tests/`: unit, integration, and end-to-end tests.
- `reference/`: private clone recon artifacts, DOM, CSS, JS, screenshots, probes, and scorecards; always Git-ignored.
- `docs/page-inventory.md`: canonical route and page-state checklist.
- `docs/component-inventory.md`: shared UI, variants, and interaction states.
- `SESSION_HANDOFF.md`: single source of truth for progress between agents.

Do not commit secrets, customer data, cookies, checkout details, or unredacted personal information.

## clone-website Workflow

Read and follow both installed skills before discovery: `clone-website` controls the cloning workflow and `ego-browser` controls browser mechanics. ego lite supports Windows and supplies the required `ego-browser` CLI after application installation and onboarding. If the CLI is unavailable, finish the official Windows setup instead of substituting another runtime.

1. Phase 0: create the private `reference/{dom,css,js,screenshots}/` workspace and run the clone on a fixed local port.
2. Phase 1: capture real DOM, CSS tokens, fonts, assets, compiled-JS configuration, section geometry, and a scroll-zero full-page screenshot.
3. Phase 2: inventory runtime animations, keyframes, scroll timelines, mutations, sticky states, and state transitions.
4. Phase 3: implement the shared shell and routes with the locked component rebuild method.
5. Phase 4: run identical probes against source and clone, iterate, and run the scored benchmark with the project verify tool (below) after every iteration.
6. Phase 5: crawl navigation, footer, and sitemap; clone and score every route individually.

### Verify tool

The skill's `scripts/run_eval.sh` calls the old `taskSpaces`/global `page` API and does not run on ego guide v2.2.0. Use the project tool in `tests/visual/` instead: write targets, widths, and an output name to `reference/verify/verify-cfg.json`, run `ego-browser nodejs -e "await import('file:///C:/Digitakarya/v2manisgrafika/tests/visual/verify.mjs')"`, then `python tests/visual/score.py reference/verify/<out> <widths> <targets>`. One run captures source and local in the same normalized state (minimized window restored, popup hidden, autoplay timers and Flickity players stopped, carousels on cell 0, origin storage cleared). It writes `eval_score.py` scorecards plus a region pixel diff and `summary.json` into the private `reference/verify/<out>/`. Extend the region anchors in `verify.mjs` per template.

The round-253 pilot showed where a component rebuild loses benchmark points. Close these gaps on every route: source CSS keyframe animations rebuilt (pilot scored animations 0), source asset filenames preserved, hidden source DOM mounted (the shared header lacks the source mega-menu DOM and images), and URL state such as `?variant=` updated as the source does.

Use one persistent ego task space for the whole job. Store full artifacts in `reference/` and print only summaries. Use absolute filesystem paths inside ego scripts. Pause autoplay media before measurement and never base layout evidence on screenshots taken after programmatic scrolling.

Never run destructive or transactional actions on the source site. Do not submit orders or contact forms.

When evidence conflicts, use this source-of-truth order: **live ego-browser measurement, captured DOM/CSS/runtime evidence, reference screenshot, documented agent assumption**. Record assumptions and unresolved conflicts in `SESSION_HANDOFF.md`; never silently guess.

## Evidence-Calibrated Reporting

Report fidelity claims strictly at the level proven by the available evidence. Matching DOM structure, text content, element counts, bounding boxes, or computed styles proves only those measured properties; it does **not** prove that a component looks the same, is visually close, or is complete.

- Never say or imply that an area is "sama", "disamakan", "mirip", "matched", "fixed", "selesai", or equivalent based only on geometry, DOM, CSS, build success, or lint success.
- A visual-fidelity claim requires normalized source/local screenshots at the same viewport and state, direct visual inspection, and the required diff/benchmark evidence. State-specific UI such as drawers, menus, overlays, hover states, and expanded submenus requires its own paired screenshots.
- If screenshot capture is unavailable, minimized, blocked, stale, or contains mismatched popup/lazy-loading state, explicitly label the result **not visually verified**. Do not convert supporting measurements into a visual conclusion.
- Before reporting progress, list material behavior or visual states that remain absent or approximate, including nested interactions, animation, icons, imagery, sticky behavior, scroll behavior, focus/hover states, and responsive variants.
- Use precise wording such as "the measured width matches" or "the initial-state DOM structure is implemented" instead of broad wording such as "the drawer matches".
- When the user reports that an implementation does not look right, treat that report as evidence that the visual gate remains open. Re-sample the source and clone; do not defend an earlier geometry-based conclusion.
- Never present a partial structural approximation as a faithful reproduction. Mark it as **approximate/in progress** in both the response and `SESSION_HANDOFF.md` until visual verification passes.

Freeze the initial route manifest after discovery. Newly found routes or states must be added to `docs/page-inventory.md` and `SESSION_HANDOFF.md` before implementation.

## Asset Rules

Reproduce approved assets exactly where available. Download every required asset into `public/assets/` so the clone works locally without depending on the source host; never hotlink production assets. Preserve useful source filenames while normalizing collisions, record each asset's source URL and usage in `docs/asset-manifest.md`, and deduplicate identical files by hash. Record source URL, local path, hash, dimensions, route usage, and license/authorization status. Match the source font, crop, focal point, icon, animation, and media behavior. Do not substitute placeholders in work marked verified.

## Reference Baseline and Design Inventory

Record the source snapshot date, browser state, locale, cookies/consent state, and viewport in each evidence batch. Evidence from different source revisions must not be silently mixed. Create `docs/design-tokens.md` for measured fonts, colors, spacing, containers, breakpoints, icon sizes, radii, shadows, transitions, and image ratios. Derive these values from captures and computed styles rather than visual guesses.

Use Indonesia as the fixed source-site condition: Indonesian market/region, local currency and locale behavior where offered, logged-out session, empty cart, and a consistent consent state. Record any source behavior that prevents these conditions from being reproduced.

Required viewport widths come from source breakpoint discovery, not generic presets. Run the original and clone through identical `ego-browser` probes at identical viewports. Store source, local, diff screenshots, probe JSON, `scorecard.json`, and `report.md` together. A browser state must be reproducible: same route, locale, consent state, fixture data, scroll position, and open overlay.

## Definition of Complete

A route is complete only when its inventory row includes source URL, local route, viewport captures, required assets, implemented interactions, responsive checks, and verification evidence. Responsive behavior must match the source at every captured width, not merely look acceptable. Capture both source and local pages at identical viewport dimensions and compare full-page and state-specific screenshots.

Do not claim "complete", "successful", "pixel-perfect", or "verified" while any screenshot mismatch remains unexplained at any required device size. The `clone-website` benchmark must score at least 90 overall with no failing dimension, and every route needs its own scorecard. Zero browser console errors, uncaught exceptions, build errors, and broken internal links are allowed. Check header/footer consistency, typography, exact spacing, colors, crops, focus/hover states, keyboard behavior, overlays, scroll behavior, loading/empty/error states, and 404 behavior. One representative template does not prove all content variants.

**Template-tier verification (owner decision 2026-11-06).** For multi-route templates (collections, content pages, editorial), the template is the unit of work. A source template survey groups the routes, and the owner approves the template list and the representatives before building starts. Representatives get the full gate described above: every breakpoint, scorecard, region diff, and real images downloaded to `public/assets/`. Every other route gets a light sweep at 1-2 widths: it must render with zero console errors, and its page height and Shopify section IDs are compared with the source. A route whose height differs by more than max(1 %, 100 px), or that is missing a source section, is promoted to representative. Non-representative routes stay labelled **approximate / not visually verified** and use placeholder images until the CMS supplies them. If a representative stays below 90 and the remaining failures are traced outside the template (placeholders, mocks, third-party assets), stop and report; the owner decides whether to accept it as approximate. Never call it verified.

**CMS-template scope reduction (owner decision 2026-11-06).** The goal for multi-route content is one reusable template per page type for the future CMS, not a per-page reproduction. Shopify theme templates (collection, standard article, blog indexes, size-guide page, unique pages) are still reproduced from source on their representatives. Page-builder layouts (Shogun `shg-*`: 21 articles and 6 pages) are **not** reproduced page by page. They render through one project-designed "content block" template (heading, rich text, image, image grid, button, video) styled with source tokens, and a script maps each page's content into those blocks. These routes are labelled **own design, not source-faithful**. They are checked by owner screenshot review, not by source benchmark. Third-party press text (media-stories article bodies) is not copied: keep title, publication, date, hero image, and link, and use placeholder body text of equivalent length. App-rendered pages (wishlist, swym-wishlist, search, the-vine-club) are built in their logged-out empty state only, as mocks.

**Final build scope (owner decision 2026-11-06, supersedes the template table where they conflict).** The canonical list is `docs/page-inventory.md` "Final Build Scope". In short:
- **Collection:** only `/collections/new-in` is reproduced and verified, plus the `/collections` list page (owner addition 2026-11-06). Owner decision 2026-11-06 (round 257): collections linked from the header, mega-menu, or footer are **not** built; every collection other than new-in returns a local 404.
- **Blog portal:** `/blogs` is a new own-design portal (the source returns 404 there). It lists every article from all 7 blogs with category filters, and `/blogs/<blog>` opens the portal with that filter active.
- **Article detail:** one own-design template for every article, styled after `/blogs/promotions/a-little-love-for-your-carryall`. Owner articles are mapped into content blocks; media-stories bodies use placeholder text. Real hero images are used for every article card and for the reference article. Images inside other articles are placeholders.
- **Pages:** about-us, the 4 policy pages (terms, privacy, returns, shipping; on the content-block template), contact-us, faqs, and wishlist (empty-state mock).
- **Search:** the source `/search` template, with mock results over local products.
- **Excluded by owner (local 404):** size guides, the-btv-stores, the-vine-club, swym-wishlist, `/pages/search`, and non-navigation collections.

The same restriction applies to component-level language: do not call a hero, footer, drawer, menu, or other state "matched" or "the same" until its paired state-specific screenshots have been normalized, compared, and accepted. Passing lint/build and matching numeric probes are supporting checks, not substitutes for the visual gate.

Performance scores and bundle optimization are not acceptance gates during the fidelity phase. Avoid changes that alter appearance merely to improve performance.

## Session Handoff Protocol

Every agent must read `SESSION_HANDOFF.md` before editing and update it before ending a session. Update it after each meaningful milestone so interruption does not erase context. Never mark work complete without paths to code and evidence.

Use this structure:

```md
# Session Handoff
Last updated: YYYY-MM-DD HH:mm Asia/Jakarta
Agent/session: <name or identifier>
Overall phase: discovery | scaffold | implementation | verification

## Completed
- [route/task] result; files; evidence path; verification performed

## In Progress
- [owner] task; exact current state; next command/action

## Remaining
- [priority] task; prerequisites; acceptance criteria

## Blockers and Decisions
- blocker/decision; evidence; workaround or required input

## Coverage
| Route/state | Discovered | Implemented | Responsive | Verified | Evidence |
|---|---:|---:|---:|---:|---|
```

If parallel work occurs, claim a route or component in **In Progress** before editing. Preserve other agents' changes and document overlaps explicitly.

## Development and Quality

Use the package scripts defined in the repository once scaffolding exists. Before handoff, run the relevant formatter, linter, tests, production build, and browser verification. Prefer reusable components for repeated patterns, semantic HTML, accessible controls, and locally hosted approved assets.

Do not commit or push incomplete, approximate, or unverified implementation. Commit and push only after the assigned batch matches its reference captures across every required viewport and passes the zero-error checks. Keep commits focused with imperative subjects such as `feat: reproduce collection filters` or `test: cover mobile navigation`. Never rewrite or discard another agent's changes to make a batch pass.

When discovery, capture, build, or comparison fails, retry first with approaches allowed by the `clone-website` skill: restore the ego tab/task space, freeze media, reset browser storage/state, use smaller self-contained probes, inspect downloaded CSS/JS, or rerun the identical probe. REA is the permitted fallback for screenshot capture only, under the constraints above; Playwright and other unlisted runtimes remain disallowed. Record failed methods and artifact paths in the handoff so later agents do not repeat them blindly.

The canonical Git remote is `https://github.com/raihante/v2manisgrafika.git`. Do not commit or push discovery scaffolding merely to create activity; the existing visual-verification gate still applies.

The current delivery target is local development only. Do not add hosting-specific rewrites, credentials, deployment automation, or production environment assumptions until the owner explicitly starts the deployment phase.

## Current Starting Point

The repository has no website implementation yet. `SESSION_HANDOFF.md`, `clone-website`, ego lite, and `ego-browser` are installed and the Windows runtime has passed its readiness check. Begin Phase 0 with one persistent task space, then populate both inventories before implementation.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
