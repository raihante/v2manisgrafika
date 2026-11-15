import type { CSSProperties } from "react";
import type { SourceIcon } from "@/lib/storefront/types";

// Renders an inline SVG captured from the source theme (props + sanitized inner markup from the shell repository).
export function SourceSvg({ icon, style }: { icon: SourceIcon; style?: CSSProperties }) {
  return <svg {...icon.props} style={style} dangerouslySetInnerHTML={{ __html: icon.inner }} />;
}
