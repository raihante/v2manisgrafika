"use client";
/* eslint-disable @next/next/no-img-element -- source markup uses a plain <img> driven by lazysizes */
// <img> that behaves like the source theme's lazysizes (data-sizes="auto"): the server markup carries the 20px
// placeholder in src and the widths in data-srcset. When the image comes near the viewport, srcset is filled in, sizes
// is set to the rendered width in px (and kept updated on resize, as lazysizes autosizes does), and the classes become
// "lazyautosizes lazyloaded". Images further down keep the placeholder until scrolled near, as on the source.
// APPROXIMATION: "near" uses a fixed 370px margin (lazysizes' default `expand`); measured on /collections at 390x844
// (reference/dom/r257b-collections/pairs.json: cards 1-3 loaded, 4-8 still lazyload on both sites).
import { useEffect, useRef } from "react";

const EXPAND = "370px 0px";

// style: the source inline style of the <img> (e.g. object-position on the contact header image).
type Props = { src: string; srcset: string; width: number; height: number; alt: string; className?: string; style?: React.CSSProperties };

export default function LazySizesImage({ src, srcset, width, height, alt, className = "", style }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    const size = () => { const w = img.offsetWidth; if (w > 0) img.sizes = `${w}px`; };
    let loaded = false;
    const load = () => {
      loaded = true;
      size();
      img.srcset = srcset;
      img.className = `${className ? `${className} ` : ""}lazyautosizes lazyloaded`;
    };
    const io = new IntersectionObserver((entries) => { if (!loaded && entries.some((e) => e.isIntersecting)) { load(); io.disconnect(); } }, { rootMargin: EXPAND });
    io.observe(img);
    const onResize = () => { if (loaded) size(); };
    window.addEventListener("resize", onResize);
    return () => { io.disconnect(); window.removeEventListener("resize", onResize); };
  }, [srcset, className]);
  return <img ref={ref} className={`lazyload ${className}`} width={width} height={height} data-sizes="auto" src={src} data-srcset={srcset} fetchPriority="low" alt={alt} style={style} />;
}
