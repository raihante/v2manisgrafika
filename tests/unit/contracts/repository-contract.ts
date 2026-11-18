// Repository contract suite. Every adapter set (fixtures today, MySQL in the backend phase) must pass it:
//   describeRepositoryContract("mysql", mysqlRepositories)
// The checks describe behaviour the storefront components rely on, not fixture specifics.
import { describe, expect, it } from "vitest";
import type { Repositories } from "@/lib/data";
import type { SafeHtml } from "@/lib/html/safe-html";
import { optionValues } from "@/lib/catalog/types";
import type { ContentBlock } from "@/lib/pages/types";

const UNSAFE = /<script|<iframe|\son[a-z]+\s*=|javascript:/i;
const expectSafe = (html: SafeHtml) => expect(html).not.toMatch(UNSAFE);
const blockHtml = (b: ContentBlock): SafeHtml[] =>
  b.type === "richText" || b.type === "callout" ? [b.html] : b.type === "iconList" ? b.items.map((i) => i.html) : b.type === "list" ? b.items : [];

export function describeRepositoryContract(name: string, repos: Repositories) {
  describe(`${name}: catalog`, () => {
    it("lists products with unique handles, integer prices and consistent variants", async () => {
      const products = await repos.catalog.listProducts();
      expect(products.length).toBeGreaterThan(0);
      expect(new Set(products.map((p) => p.handle)).size).toBe(products.length);
      for (const p of products) {
        expect(Number.isInteger(p.price) && p.price > 0, p.handle).toBe(true);
        for (const v of p.variants) {
          expect(v.options.length, `${p.handle} ${v.sku}`).toBe(p.options.length);
          v.options.forEach((value, i) => expect(p.options[i].values, `${p.handle} ${v.sku}`).toContain(value));
          expect(Number.isInteger(v.price)).toBe(true);
          if (v.compareAtPrice !== null) expect(v.compareAtPrice, `${p.handle} ${v.sku}`).toBeGreaterThan(v.price);
        }
        expect(Number.isInteger(p.minOrder) && p.minOrder >= 1, p.handle).toBe(true);
        for (const f of p.personalisation?.fields ?? []) expect(f.key && f.label, p.handle).toBeTruthy();
        expect(new Set(p.variants.map((v) => v.id)).size, p.handle).toBe(p.variants.length);
      }
    });

    it("finds products by handle and returns null for unknown handles", async () => {
      const [first] = await repos.catalog.listProducts();
      expect((await repos.catalog.getProduct(first.handle))?.title).toBe(first.title);
      expect(await repos.catalog.getProduct("no-such-product")).toBeNull();
      expect(await repos.catalog.getSummary("no-such-product")).toBeNull();
      expect(await repos.catalog.getProductPage("no-such-product")).toBeNull();
    });

    it("derives summaries from the product record (price, sizes, availability)", async () => {
      for (const s of await repos.catalog.listSummaries()) {
        const p = await repos.catalog.getProduct(s.handle);
        expect(p, s.handle).not.toBeNull();
        expect(s.title).toBe(p!.title);
        expect(s.price).toBe(p!.price);
        // Regression: quick add must know every product with a Size option (5 apparel products were missed before).
        expect(s.sizes).toEqual(optionValues(p!, "Size"));
        expect(s.soldOut).toBe(p!.variants.every((v) => !v.available));
      }
    });

    it("serves the product page for standard products with sanitized tabs", async () => {
      for (const p of await repos.catalog.listProducts()) {
        const page = await repos.catalog.getProductPage(p.handle);
        if (p.template === "bundle") { expect(page).toBeNull(); continue; }
        expect(page?.title).toBe(p.title);
        page!.tabs.forEach((t) => expectSafe(t.panelHtml));
        page!.multicolumn?.columns.forEach((c) => expectSafe(c.html));
      }
    });

    it("lists preview collections whose products all have summaries", async () => {
      for (const c of await repos.catalog.listPreviewCollections()) {
        expect((await repos.catalog.getPreviewCollection(c.handle))?.title).toBe(c.title);
        for (const p of c.products) expect(await repos.catalog.getSummary(p.handle), p.handle).not.toBeNull();
      }
    });
  });

  describe(`${name}: storefront`, () => {
    it("returns the chrome with shell, footer, newsletter and a search index of known products", async () => {
      const chrome = await repos.storefront.getChrome();
      expect(chrome.shell.desktopMenu.length).toBeGreaterThan(0);
      expect(chrome.footer.groups.length).toBeGreaterThan(0);
      expect(chrome.footer.groups.every((g) => g.links.length > 0)).toBe(true);
      expect(chrome.newsletter.title).toBeTruthy();
      for (const s of chrome.searchSuggestions) expect(await repos.catalog.getSummary(s.handle), s.handle).not.toBeNull();
    });

    it("sanitizes every shell icon", async () => {
      const visit = (v: unknown): void => {
        if (Array.isArray(v)) return v.forEach(visit);
        if (v && typeof v === "object") {
          const o = v as Record<string, unknown>;
          if ("props" in o && typeof o.inner === "string") expect(o.inner).not.toMatch(UNSAFE);
          Object.values(o).forEach(visit);
        }
      };
      visit((await repos.storefront.getChrome()).shell);
    });

    it("builds homepage rail cards whose quick add matches the catalog", async () => {
      const home = await repos.storefront.getHomepage();
      expect(home.rails.length).toBeGreaterThan(0);
      for (const card of home.rails.flatMap((r) => r.products)) {
        const s = await repos.catalog.getSummary(card.quickAdd.handle);
        expect(s, card.href).not.toBeNull();
        expect(card.quickAdd.price).toBe(s!.price);
        expect(card.quickAdd.needsOptions).toBe(s!.needsOptions);
        expect(card.quickAdd.minOrder).toBe((await repos.catalog.getProduct(s!.handle))!.minOrder);
      }
    });

    it("returns checkout branding", async () => {
      const b = await repos.storefront.getCheckoutBranding();
      expect(b.logo).toBeTruthy();
      expect(b.payments.length).toBeGreaterThan(0);
    });
  });

  describe(`${name}: collections`, () => {
    it("serves the initial grid of every handle with the cards it lists", async () => {
      const handles = await repos.collections.handles();
      expect(handles.length).toBeGreaterThan(0);
      for (const h of handles) {
        const initial = await repos.collections.getInitial(h);
        expect(initial?.handle).toBe(h);
        for (const k of initial!.keys) expect(initial!.cards[k], k).toBeDefined();
      }
      expect(await repos.collections.getInitial("no-such-collection")).toBeNull();
    });

    it("returns the collection list page", async () => {
      expect((await repos.collections.getList()).cards.length).toBeGreaterThan(0);
    });
  });

  describe(`${name}: pages`, () => {
    it("serves every content page by slug with sanitized blocks", async () => {
      const slugs = await repos.pages.contentSlugs();
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const slug of slugs) {
        const page = await repos.pages.getContentPage(slug);
        expect(page?.slug).toBe(slug);
        page!.blocks.flatMap(blockHtml).forEach(expectSafe);
      }
      expect(await repos.pages.getContentPage("no-such-page")).toBeNull();
    });

    it("serves the FAQ, contact and wishlist pages with sanitized rich text", async () => {
      const faq = await repos.pages.getFaqPage();
      expect(faq.groups.length).toBeGreaterThan(0);
      faq.groups.flatMap((g) => g.rows).forEach((r) => expectSafe(r.answerHtml));
      (await repos.pages.getContactPage()).multicolumn.columns.forEach((c) => expectSafe(c.html));
      expect((await repos.pages.getWishlistPage()).title).toBeTruthy();
    });
  });

  describe(`${name}: blogs`, () => {
    it("lists articles newest first with unique slugs and known categories", async () => {
      const [categories, articles] = await Promise.all([repos.blogs.listCategories(), repos.blogs.listArticles()]);
      const handles = new Set(categories.map((c) => c.handle));
      // CMS rule: article slugs are unique across every blog (flat /blogs/<slug> URLs).
      expect(new Set(articles.map((a) => a.slug)).size).toBe(articles.length);
      for (const a of articles) expect(handles, a.slug).toContain(a.category);
      articles.slice(1).forEach((a, i) => expect(articles[i].date >= a.date, a.slug).toBe(true));
    });

    it("returns article bodies (placeholder flag for articles without stored content)", async () => {
      for (const a of await repos.blogs.listArticles()) {
        const body = await repos.blogs.getArticleBody(a.slug);
        expect(body, a.slug).not.toBeNull();
        expect(body!.blocks.length).toBeGreaterThan(0);
        if (!a.hasBody) expect(body!.placeholder).toBe(true);
        body!.blocks.flatMap(blockHtml).forEach(expectSafe);
      }
      expect(await repos.blogs.getArticle("no-such-article")).toBeNull();
      expect(await repos.blogs.getArticleBody("no-such-article")).toBeNull();
    });
  });

  describe(`${name}: search`, () => {
    it("returns the search template metadata", async () => {
      const meta = await repos.search.getMeta();
      expect(meta.perPage).toBeGreaterThan(0);
      expect(meta.sort.initial).toBeTruthy();
    });
  });
}
