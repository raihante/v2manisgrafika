"use client";
// Flickity 3 equivalent for carousels whose cells have different widths (FAQ category buttons; source options
// cellAlign:"center", contain:true, draggable, no dots / buttons / autoPlay; reference/js/r256-header/jsc-reset-scripts.js
// initFaqSlider). Same rendering as Flickity's percent positioning: each cell gets translateX(x / ownWidth * 100%), the
// slider translateX(-position / viewportWidth * 100%), the viewport the tallest cell's height. Physics: selectedAttraction
// 0.025, friction 0.28. Dragging releases onto the nearest cell target (Flickity's resting-position rule).
import { useCallback, useLayoutEffect, useRef, useState } from "react";

const ATTRACTION = 0.025;
const FRICTION = 0.28;

export function useCellCarousel(count: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [selected, setSelectedState] = useState(0);
  const selectedRef = useRef(0);
  const setSelected = useCallback((i: number) => { selectedRef.current = i; setSelectedState(i); }, []);
  const [height, setHeight] = useState<number | null>(null);
  const geo = useRef<{ vw: number; xs: number[]; ws: number[]; targets: number[] }>({ vw: 1, xs: [], ws: [], targets: [] });
  const pos = useRef(0);
  const velocity = useRef(0);
  const target = useRef(0);
  const raf = useRef(0);
  const drag = useRef<{ start: number; startPos: number; last: number; prev: number; moved: boolean } | null>(null);

  const render = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const { vw, xs, ws } = geo.current;
    slider.style.transform = `translateX(${Math.round((-pos.current / vw) * 10000) / 100}%)`;
    Array.from(slider.children).forEach((cell, k) => { (cell as HTMLElement).style.transform = `translateX(${ws[k] ? Math.round((xs[k] / ws[k]) * 10000) / 100 : 0}%)`; });
  }, []);

  const measure = useCallback(() => {
    const viewport = viewportRef.current, slider = sliderRef.current;
    if (!viewport || !slider) return;
    const cells = Array.from(slider.children) as HTMLElement[];
    const vw = viewport.clientWidth || 1;
    // Fractional widths, as Flickity measures cells (getSize uses getBoundingClientRect).
    const outer = (el: HTMLElement) => { const c = getComputedStyle(el); return el.getBoundingClientRect().width + parseFloat(c.marginLeft) + parseFloat(c.marginRight); };
    const ws = cells.map((c) => c.getBoundingClientRect().width);
    const xs: number[] = [];
    let x = 0;
    for (const c of cells) { xs.push(x); x += outer(c); }
    const content = x;
    let targets = cells.map((c, k) => xs[k] + outer(c) / 2 - vw / 2);
    // contain: content narrower than the viewport is centred as a whole; otherwise targets stay inside the content.
    targets = content <= vw ? targets.map(() => (content - vw) / 2) : targets.map((t) => Math.min(Math.max(t, 0), content - vw));
    geo.current = { vw, xs, ws, targets };
    setHeight(Math.max(0, ...cells.map((c) => c.offsetHeight)));
    pos.current = target.current = targets[Math.min(selectedRef.current, targets.length - 1)] ?? 0;
    render();
  }, [render]);

  const animate = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const step = () => {
      velocity.current += (target.current - pos.current) * ATTRACTION;
      velocity.current *= 1 - FRICTION;
      pos.current += velocity.current;
      if (Math.abs(velocity.current) < 0.1 && Math.abs(target.current - pos.current) < 0.5) { pos.current = target.current; velocity.current = 0; render(); return; }
      render();
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [render]);

  useLayoutEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf.current); };
  }, [measure, count]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(raf.current);
    drag.current = { start: e.clientX, startPos: pos.current, last: e.clientX, prev: e.clientX, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.start) > 3) { d.moved = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }
    if (!d.moved) return;
    d.prev = d.last; d.last = e.clientX;
    pos.current = d.startPos - (e.clientX - d.start);
    render();
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    // Resting position = current position plus the remaining glide of the release velocity; pick the nearest target.
    const v = -(d.last - d.prev);
    const resting = pos.current + v / FRICTION;
    const { targets } = geo.current;
    let best = 0;
    targets.forEach((t, k) => { if (Math.abs(t - resting) < Math.abs(targets[best] - resting)) best = k; });
    setSelected(best);
    target.current = targets[best] ?? 0;
    velocity.current = v;
    animate();
  };

  return { viewportRef, sliderRef, selected, setSelected, height, dragged: () => !!drag.current?.moved, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
}
