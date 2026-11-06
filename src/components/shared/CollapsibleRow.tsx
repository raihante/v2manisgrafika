"use client";
// <collapsible-row> accordion as the source theme animates it (reference/js/d57b4de829f727fa.js class CollapsibleRow):
// summary click -> open: details height from the summary to summary + content in 400 ms ease-out; close: back to the
// summary height in 250 ms ease; the open attribute is set before opening and cleared after closing.
import { useRef } from "react";

type Props = { className: string; detailsId: string; summary: React.ReactNode; children: React.ReactNode };

export default function CollapsibleRow({ className, detailsId, summary, children }: Props) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const state = useRef<{ animation: Animation | null; closing: boolean; expanding: boolean }>({ animation: null, closing: false, expanding: false });
  const finish = (open: boolean) => {
    const d = detailsRef.current!;
    d.open = open;
    state.current = { animation: null, closing: false, expanding: false };
    d.style.height = d.style.overflow = "";
  };
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const d = detailsRef.current!;
    const s = state.current;
    const summaryEl = d.querySelector("summary") as HTMLElement;
    const content = d.querySelector(".collapsible__content") as HTMLElement;
    d.style.overflow = "hidden";
    if (s.closing || !d.open) {
      d.style.height = `${d.offsetHeight}px`;
      d.open = true;
      requestAnimationFrame(() => {
        s.expanding = true;
        s.animation?.cancel();
        s.animation = d.animate({ height: [`${d.offsetHeight}px`, `${summaryEl.offsetHeight + content.offsetHeight}px`] }, { duration: 400, easing: "ease-out" });
        s.animation.onfinish = () => finish(true);
        s.animation.oncancel = () => { s.expanding = false; };
      });
    } else if (s.expanding || d.open) {
      s.closing = true;
      s.animation?.cancel();
      s.animation = d.animate({ height: [`${d.offsetHeight}px`, `${summaryEl.offsetHeight}px`] }, { duration: 250, easing: "ease" });
      s.animation.onfinish = () => finish(false);
      s.animation.oncancel = () => { s.closing = false; };
    }
  };
  return (
    <collapsible-row className={className}>
      <details id={detailsId} ref={detailsRef}>
        <summary onClick={onClick}> {summary} <span></span> </summary>
        {children}
      </details>
    </collapsible-row>
  );
}
