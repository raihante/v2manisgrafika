"use client";
// Storefront chrome data for the client shell components (header, side panels, footer, newsletter, search page icon).
// Filled on the server by src/components/shell/SiteChrome.tsx from the storefront repository.
import { createContext, useContext } from "react";
import type { ChromeData, ShellData } from "@/lib/storefront/types";

const ChromeContext = createContext<ChromeData | null>(null);

export function StorefrontProvider({ chrome, children }: { chrome: ChromeData; children: React.ReactNode }) {
  return <ChromeContext.Provider value={chrome}>{children}</ChromeContext.Provider>;
}

export function useChrome(): ChromeData {
  const chrome = useContext(ChromeContext);
  if (!chrome) throw new Error("useChrome() needs <SiteChrome> (StorefrontProvider) above it");
  return chrome;
}

export const useShell = (): ShellData => useChrome().shell;
