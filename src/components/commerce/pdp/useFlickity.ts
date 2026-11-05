"use client";
// Minimal Flickity 3 equivalent for the product page carousels (the source uses Flickity with these options):
// percent positioning (cells translateX(k*100%), slider translateX(-x%)), selectedAttraction 0.025 / friction 0.28
// physics, pointer dragging, wrapAround or contain, optional autoPlay that pauses on hover and stops on interaction,
// and a viewport height equal to the tallest cell (adaptiveHeight off).
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Options = { count: number; wrapAround?: boolean; contain?: boolean; autoPlay?: number; resetKey?: unknown };

export function useFlickity({ count, wrapAround = false, contain = false, autoPlay = 0, resetKey }: Options) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement & HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const [height, setHeight] = useState<number | null>(null);
  const pos = useRef(0); // in cells
  const velocity = useRef(0);
  const target = useRef(0);
  const raf = useRef(0);
  const cellFrac = useRef(1); // cell width / viewport width
  const drag = useRef<{ x: number; start: number; last: number; t: number; moved: boolean } | null>(null);
  const playing = useRef(autoPlay > 0);
  const hovered = useRef(false);

  const maxPos = useCallback(() => (contain ? Math.max(0, count - 1 / cellFrac.current) : count - 1), [contain, count]);

  const render = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const x = pos.current;
    slider.style.transform = `translateX(${-(Math.round(x * cellFrac.current * 10000) / 100)}%)`;
    Array.from(slider.children).forEach((cell, k) => {
      // wrapAround: each cell sits in the copy of the strip nearest the current position.
      const shift = wrapAround && count > 1 ? Math.round((x - k) / count) * count : 0;
      (cell as HTMLElement).style.transform = `translateX(${(k + shift) * 100}%)`;
    });
  }, [count, wrapAround]);

  const animate = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const step = () => {
      if (!drag.current) {
        velocity.current += (target.current - pos.current) * 0.025;
        pos.current += velocity.current;
        velocity.current *= 1 - 0.28;
      }
      render();
      if (Math.abs(target.current - pos.current) < 0.001 && Math.abs(velocity.current) < 0.001 && !drag.current) {
        pos.current = target.current;
        if (wrapAround && count > 0) { const n = ((Math.round(pos.current) % count) + count) % count; target.current += n - pos.current; pos.current = n; }
        render();
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [count, render, wrapAround]);

  // opts.user: a UI change (dot, nav cell, button, drag) stops autoPlay, as Flickity's uiChange does.
  const select = useCallback((index: number, opts: { instant?: boolean; user?: boolean } = {}) => {
    if (!count) return;
    if (opts.user) playing.current = false;
    let t = index;
    if (wrapAround) {
      // Move the shortest way round the loop.
      const base = Math.round(pos.current);
      const current = ((base % count) + count) % count;
      let delta = (((index - current) % count) + count) % count;
      if (delta > count / 2) delta -= count;
      t = base + delta;
    } else t = Math.max(0, Math.min(index, count - 1));
    const n = ((t % count) + count) % count;
    target.current = contain ? Math.min(t, maxPos()) : t;
    setSelected(n);
    if (opts.instant) { pos.current = target.current; velocity.current = 0; render(); } else animate();
  }, [animate, contain, count, maxPos, render, wrapAround]);

  const next = useCallback(() => {
    const n = selected + 1;
    select(!wrapAround && n >= count ? 0 : n);
  }, [count, select, selected, wrapAround]);
  const previous = useCallback(() => select(selected - 1 < 0 && !wrapAround ? 0 : selected - 1), [select, selected, wrapAround]);

  // Measure cell width and the tallest cell (gallery size), like Flickity's setGallerySize.
  useLayoutEffect(() => {
    const viewport = viewportRef.current, slider = sliderRef.current;
    if (!viewport || !slider) return;
    const measure = () => {
      const cells = Array.from(slider.children) as HTMLElement[];
      const w = viewport.getBoundingClientRect().width;
      if (cells[0] && w) cellFrac.current = cells[0].getBoundingClientRect().width / w;
      // Flickity uses each cell's outerHeight (margins included).
      const outer = (c: HTMLElement) => { const st = getComputedStyle(c); return c.getBoundingClientRect().height + parseFloat(st.marginTop) + parseFloat(st.marginBottom); };
      setHeight(cells.length ? Math.max(...cells.map(outer)) : null);
      render();
    };
    measure();
    const ro = new ResizeObserver(measure);
    Array.from(slider.children).forEach((c) => ro.observe(c));
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [render, count, resetKey]);

  // New cell set (e.g. colour change): back to the first cell without animation.
  useEffect(() => { select(0, { instant: true }); }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!autoPlay || count < 2) return;
    const timer = window.setInterval(() => { if (playing.current && !hovered.current) next(); }, autoPlay);
    return () => window.clearInterval(timer);
  }, [autoPlay, count, next]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // pauseAutoPlayOnHover: Flickity listens on the carousel element itself (rootProps go on .flickity-enabled).
  // Flickity.data(el)-like handle on the carousel element (select / stopPlayer), used by the visual verify tool to put
  // local carousels in the same instant state as the source ones; automated browsers throttle requestAnimationFrame.
  useEffect(() => {
    const el = rootRef.current as (HTMLElement & { flickity?: unknown }) | null;
    if (!el) return;
    el.flickity = { select: (i: number, instant = false) => select(i, { instant, user: true }), stopPlayer: () => { playing.current = false; } };
    return () => { delete el.flickity; };
  }, [select]);
  // Handlers only (no refs inside, so components can spread them during render); refs are returned separately.
  const rootHandlers = {
    onPointerOver: () => { hovered.current = true; },
    onPointerLeave: () => { hovered.current = false; },
  };
  const suppressClick = useRef(false);
  const viewportHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      playing.current = false;
      drag.current = { x: e.clientX, start: pos.current, last: e.clientX, t: performance.now(), moved: false };
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const w = viewportRef.current?.getBoundingClientRect().width || 1;
      if (Math.abs(e.clientX - d.x) > 3) d.moved = true;
      velocity.current = -(e.clientX - d.last) / (w * cellFrac.current);
      d.last = e.clientX;
      pos.current = d.start - (e.clientX - d.x) / (w * cellFrac.current);
      render();
    },
    onPointerUp: () => {
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      suppressClick.current = d.moved;
      if (!d.moved) { render(); return; }
      const moved = pos.current - d.start;
      const index = Math.abs(moved) > 0.1 && Math.abs(moved) < 0.5 ? Math.round(d.start) + Math.sign(moved) : Math.round(pos.current);
      select(index, { user: true });
    },
    onClickCapture: (e: React.MouseEvent) => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); suppressClick.current = false; } },
  };
  const viewportStyle = height ? { height: `${height}px` } : undefined;

  return { selected, select, next, previous, rootRef, rootHandlers, viewportRef, viewportHandlers, viewportStyle, sliderRef };
}
