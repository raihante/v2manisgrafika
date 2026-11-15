// Fixture search adapter (server only): template metadata from src/data/search.json (scripts/build-search-data.mjs,
// 2026-11-06 snapshot). Results are the MOCK client search in ./query.ts over the collection data source
// (docs/mock-behaviors.md "Search page"); the backend phase replaces both with a search API.
import "server-only";
import meta from "@/data/search.json";
import type { SearchMeta, SearchRepository } from "./types";

export const fixtureSearch: SearchRepository = { getMeta: async () => meta as SearchMeta };
