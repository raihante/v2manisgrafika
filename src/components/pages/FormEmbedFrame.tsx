"use client";
// iframe of an embedded third-party form. The source form app (Hulk Form Builder) sizes its iframe from the form
// document: style height = document height + 12px (measured 599 -> 611 at 1920, 526 -> 538 at 390;
// reference/dom/r257d-contact/). The local MOCK form document posts its height the same way.
import { useEffect, useRef, useState } from "react";

type Props = { id: string; formId: string; src: string; title: string; width: string; frameBorder: string; initialHeight: number };

export default function FormEmbedFrame({ id, formId, src, title, width, frameBorder, initialHeight }: Props) {
  const [height, setHeight] = useState(initialHeight);
  const ref = useRef<HTMLIFrameElement>(null);
  // The form document may report before this listener exists (it loads in parallel with hydration): ask again.
  const request = () => ref.current?.contentWindow?.postMessage({ type: "mock-form-height-request" }, window.location.origin);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "mock-form-height" || e.data.id !== formId) return;
      setHeight(Math.round(e.data.height) + 12);
    };
    window.addEventListener("message", onMessage);
    request();
    return () => window.removeEventListener("message", onMessage);
  }, [formId]);
  return <iframe ref={ref} onLoad={request} src={src} id={id} frameBorder={frameBorder} width={width} style={{ height: `${height}px` }} title={title} />;
}
