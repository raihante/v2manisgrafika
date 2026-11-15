// Composition root of the data layer (server only). Routes and server components read every repository from here;
// no component imports a fixture or an adapter directly (AGENTS.md repository boundary). The backend phase swaps the
// fixture adapters below for the MySQL adapters, one line per domain, and the contract tests in tests/unit/contracts
// run against both.
// WARNING for CMS work: the fixture adapters still back several MOCK behaviours (docs/mock-behaviors.md).
import "server-only";
import { fixtureBlogs } from "@/lib/blogs/fixture";
import type { BlogRepository } from "@/lib/blogs/types";
import { fixtureCatalog } from "@/lib/catalog/fixture";
import type { CatalogRepository } from "@/lib/catalog/types";
import { fixtureCollections } from "@/lib/collections/fixture";
import type { CollectionRepository } from "@/lib/collections/types";
import { fixturePages } from "@/lib/pages/fixture";
import type { PageRepository } from "@/lib/pages/types";
import { fixtureSearch } from "@/lib/search/fixture";
import type { SearchRepository } from "@/lib/search/types";
import { fixtureStorefront } from "@/lib/storefront/fixture";
import type { StorefrontRepository } from "@/lib/storefront/types";

export type Repositories = {
  catalog: CatalogRepository;
  collections: CollectionRepository;
  storefront: StorefrontRepository;
  pages: PageRepository;
  blogs: BlogRepository;
  search: SearchRepository;
};

export const repositories: Repositories = {
  catalog: fixtureCatalog,
  collections: fixtureCollections,
  storefront: fixtureStorefront,
  pages: fixturePages,
  blogs: fixtureBlogs,
  search: fixtureSearch,
};
