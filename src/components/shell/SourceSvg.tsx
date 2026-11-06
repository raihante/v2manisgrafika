import type { CSSProperties } from "react";
import type { SourceIcon } from "@/lib/navigation";

// Renders an inline SVG captured verbatim from the source theme (props + inner markup from the shell fixture).
export function SourceSvg({ icon, style }: { icon: SourceIcon; style?: CSSProperties }) {
  return <svg {...icon.props} style={style} dangerouslySetInnerHTML={{ __html: icon.inner }} />;
}
