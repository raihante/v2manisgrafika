// The one place sanitized HTML reaches the DOM. Only SafeHtml (produced by src/lib/html/sanitize.ts inside a
// repository adapter) is accepted, so raw strings cannot be injected by accident.
import type { ComponentPropsWithoutRef, ElementType } from "react";
import type { SafeHtml } from "@/lib/html/safe-html";

type Props<T extends ElementType> = { as?: T; html: SafeHtml } & Omit<ComponentPropsWithoutRef<T>, "children" | "dangerouslySetInnerHTML">;

export function RichText<T extends ElementType = "div">({ as, html, ...rest }: Props<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}
