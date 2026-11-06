/* eslint-disable @next/next/no-img-element -- static export (images.unoptimized); plain <img>/<picture> with local assets */
// Content-block page template (about-us, policy pages; later the Shogun articles). OWN DESIGN, NOT SOURCE-FAITHFUL:
// layout and spacing are project decisions styled with source tokens (Everett / Recoleta, page accent colours,
// source copy and images). Verified by owner screenshot review, not by the source benchmark (AGENTS.md).
import type { CSSProperties } from "react";
import type { ContentBlock, ContentImage, ContentPageData } from "@/lib/pages/content";

const MOBILE = "(max-width: 767px)";

function Picture({ image, mobile, className }: { image: ContentImage; mobile?: ContentImage; className?: string }) {
  const img = <img className={className} src={image.src} alt={image.alt} width={image.width ?? undefined} height={image.height ?? undefined} loading="lazy" decoding="async" />;
  if (!mobile) return img;
  return (
    <picture>
      <source media={MOBILE} srcSet={mobile.src} width={mobile.width ?? undefined} height={mobile.height ?? undefined} />
      {img}
    </picture>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return <h2 className={`content-block content-heading content-heading--${block.align}`}>{block.html}</h2>;
    case "richText":
      return <div className={`content-block content-rte content-rte--${block.variant}`} dangerouslySetInnerHTML={{ __html: block.html }} />;
    case "image": {
      const style = {
        "--content-img-max": block.maxWidth ? `${block.maxWidth}px` : undefined,
        "--content-img-bg": block.background ? `url("${block.background}")` : undefined,
        "--content-img-bg-mobile": block.mobileBackground ? `url("${block.mobileBackground}")` : undefined,
      } as CSSProperties;
      const picture = <Picture image={block.image} mobile={block.mobile} className="content-image__img" />;
      return (
        <figure className={`content-block content-image${block.background ? " content-image--backdrop" : ""}${block.href ? " content-image--link" : ""}`} style={style}>
          {block.href ? <a href={block.href} aria-label={block.image.alt || "Read more"}>{picture}</a> : picture}
        </figure>
      );
    }
    case "imageGrid":
      return (
        <div className="content-block content-grid">
          {block.items.map((image) => <Picture key={image.src} image={image} className="content-grid__img" />)}
        </div>
      );
    case "button":
      return <p className="content-block content-button-row"><a className="content-button" href={block.href}>{block.label}</a></p>;
    case "video":
      return <video className="content-block content-video" src={block.src} poster={block.poster} controls playsInline preload="metadata" />;
    case "iconList":
      return (
        <ol className={`content-block content-icons content-icons--${block.variant}`}>
          {block.items.map((item, i) => (
            <li className="content-icons__item" key={i}>
              <span className="content-icons__icon"><img src={item.icon.src} alt="" width={item.icon.width ?? undefined} height={item.icon.height ?? undefined} loading="lazy" decoding="async" /></span>
              <div className="content-icons__body">
                {item.title ? <h3 className="content-icons__title">{item.title}</h3> : null}
                <div className="content-rte" dangerouslySetInnerHTML={{ __html: item.html }} />
              </div>
            </li>
          ))}
        </ol>
      );
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return <Tag className="content-block content-list">{block.items.map((html, i) => <li key={i} dangerouslySetInnerHTML={{ __html: html }} />)}</Tag>;
    }
    case "callout":
      return (
        <div className="content-block content-callout">
          <span className="content-callout__title">{block.title}</span>
          <div className="content-callout__text" dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );
  }
}

export default function ContentPage({ page }: { page: ContentPageData }) {
  const style = { "--content-accent": page.accent, "--content-text": page.textColor } as CSSProperties;
  const hero = page.hero;
  return (
    <article className={`content-page content-page--${page.slug}`} style={style}>
      {page.heroTitle ? (
        <header className="content-hero content-hero--title">
          <h1 className="content-hero__title">{page.heroTitle.map((line) => <span key={line}>{line}</span>)}</h1>
        </header>
      ) : hero ? (
        <header className="content-hero content-hero--image" style={{ "--content-hero-max": `${hero.maxWidth}px`, "--content-hero-h": `${hero.height}px`, "--content-hero-h-mobile": `${hero.mobileHeight ?? hero.height}px` } as CSSProperties}>
          <h1 className="sr-only">{page.title}</h1>
          <img className={`content-hero__img content-hero__img--${hero.fit}`} src={hero.image.src} alt="" width={hero.image.width ?? undefined} height={hero.image.height ?? undefined} decoding="async" />
        </header>
      ) : (
        <h1 className="sr-only">{page.title}</h1>
      )}
      <div className="content-body">
        {page.blocks.map((block, i) => <Block block={block} key={i} />)}
      </div>
    </article>
  );
}
