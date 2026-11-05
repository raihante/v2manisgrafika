"use client";
/* eslint-disable @next/next/no-img-element -- source markup uses plain <img> (inside <picture> where the source has one) */
// Product detail page (component rebuild). The DOM follows the source main-product / product-recommendations sections
// (class names, nesting and the hidden-but-mounted parts) so the ported source CSS in pdp-source.css applies at every
// breakpoint. Behaviour (Flickity galleries, variant selection, tabs, sticky bar) is reimplemented in React.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { openCartDrawer } from "@/components/Overlays";
import notifyIcon from "@/data/notify-icon.json";
import { localCart } from "@/lib/cart";
import type { ProductCard, ProductDetail, ProductVariant } from "@/lib/product-details";
import { ArrowIcon, ErrorIcon, Spinner, TextButtonArrow, ZoomIcon } from "./pdp/icons";
import PhotoSwipe from "./pdp/PhotoSwipe";
import SourceProductCard, { WishlistButton } from "./pdp/SourceProductCard";
import { useFlickity } from "./pdp/useFlickity";

// Section ids of the source product template (same for every product that uses it).
const SECTION = "template--22834210603287__main-product";
const RECS = "template--22834210603287__product-recommendations";
const PAIR_AUTOPLAY_MS = 2000; // jsc-reset-scripts.js applyComplementaryFlickity: autoPlay 2e3

const parsePrice = (text: string) => Number(text.replace(/[^0-9]/g, "")) || 0;

const Price = ({ text }: { text: string }) => (
  <span className="price">
    <span className="amount"> {text}</span>
    <small className="unit-price  hidden"><span></span><span className="unit-price-separator">/</span><span></span></small>
  </span>
);

const NotifyIcon = () => (
  <svg className="notify-icon" xmlns="http://www.w3.org/2000/svg" viewBox={notifyIcon.viewBox}>{notifyIcon.paths.map((d) => <path key={d.slice(0, 24)} className="cls-1" d={d} />)}</svg>
);

// Swym injects its count bar inside the wishlist button after load; a nested <button> cannot be rendered by React
// (invalid nesting breaks hydration), so it is appended to the DOM the same way, once, after mount.
function useSwymBar(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const host = ref.current?.querySelector(".swym-add-to-wishlist-view-product");
    if (!host || host.querySelector(".swym-wishlist-button-bar")) return;
    const bar = document.createElement("div");
    bar.className = "swym-wishlist-button-bar swym-default";
    bar.innerHTML = '<div class="swym-btn-container swym-inject" data-position="default"><button class="swym-button swym-add-to-wishlist swym-inject swym-has-fave-count swym-iconbtnlink swym-heart swym-loaded" aria-label="Save it for later" aria-pressed="false" tabindex="-1"><span class="swym-wishlist-cta">Save it for later</span></button><span class="swym-fave-count" data-count="0">0</span></div>';
    host.appendChild(bar);
  }, [ref]);
}

type OptionsProps = { product: ProductDetail; selected: string[]; choose: (index: number, value: string) => void; suffix?: string; colourIndex: number };

// variant-selects > .variations > fieldset per option, radios + labels exactly as the theme renders them (colour
// categories such as Classic / Seasonal get their own label + swatch group; the label value shows only in the
// group that holds the selected colour).
function VariantFieldsets({ product, selected, choose, suffix = "", colourIndex }: OptionsProps) {
  return (
    <div className="variations">
      {product.options.map((option, index) => {
        const isColour = index === colourIndex;
        const disabled = (value: string) => !product.variants.some((v) => v.available && v.options.every((o, i) => (i === index ? o === value : o === selected[i])));
        const radio = (value: string) => {
          const k = option.values.indexOf(value);
          const id = `${SECTION}-${index + 1}-${option.ids[k] ?? k}${suffix}`;
          return [
            <input key={`i-${value}`} type="radio" id={id} name={`${option.name}${suffix}`} value={value} form={`product-form-${SECTION}`} checked={selected[index] === value} className={disabled(value) ? "is-disabled" : undefined} onChange={() => choose(index, value)} />,
            isColour ? (
              <label key={`l-${value}`} className="" htmlFor={id} style={{ "--option-color": option.colors[k] || undefined, "--option-color-image": product.swatches[value] ? `url('${product.swatches[value]}')` : undefined } as React.CSSProperties}>{value}</label>
            ) : (
              <label key={`l-${value}`} htmlFor={id}><span>{value}</span></label>
            ),
          ];
        };
        if (!isColour) {
          return (
            <fieldset key={option.name} className="product-form__input product-form__input--block" data-index={`option${index + 1}`} data-handle={option.handle}>
              <div className="form__label">{option.name}: <span className="form__label__value">{selected[index]}</span></div>
              {option.values.map(radio)}
            </fieldset>
          );
        }
        const colourClass = `product-form__input product-form__input--color product-form__input--color--${suffix ? "" : "regular"}${option.groups ? " product-form__input--color-categorized" : ""}`;
        return (
          <fieldset key={option.name} className={colourClass} data-use-images={suffix ? "" : "false"} data-index={`option${index + 1}`} data-handle={option.handle}>
            {option.groups ? option.groups.map((group) => (
              <div key={group.name} className="product-form__color-category" data-color-category={group.name}>
                <div className="form__label form__label--color-category">{group.name} <span className="form__label__value">{group.values.includes(selected[index]) ? selected[index] : ""}</span></div>
                <div className="product-form__color-category-swatches">{group.values.map(radio)}</div>
              </div>
            )) : (
              <>
                <div className="form__label"><span className="form__label__value">{selected[index]}</span></div>
                {option.values.map(radio)}
              </>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

function AddToCartHolder({ variant, onAdd, sticky = false }: { variant: ProductVariant | undefined; onAdd: () => void; sticky?: boolean }) {
  const available = !!variant?.available;
  return (
    <div className="add_to_cart_holder ">
      <button type="submit" name="add" id={sticky ? "AddToCartSticky" : "AddToCart"} className="single-add-to-cart-button button" style={available ? undefined : { display: "none" }} onClick={(e) => { e.preventDefault(); onAdd(); }}>
        <span className="single-add-to-cart-button--text">Add To Bag</span>
        <span className="loading-overlay"><Spinner /></span>
      </button>
      {!sticky && (
        <div className="jsc-preorder-notice" style={{ display: "none" }}>
          <p className="jsc-preorder-notice__ship">Ships out from end November!</p>
          <p className="jsc-preorder-notice__checkout">Pre-order and regular items cannot be purchased together.</p>
        </div>
      )}
      <div className="jsc-preorder-limit-notice form-notification error" style={{ display: "none" }} role="alert"><ErrorIcon /><span>This preorder item is no longer available.</span></div>
      {/* MOCK back-in-stock (docs/mock-behaviors.md "Notify Me"): shown for sold-out variants, no subscription is sent. */}
      <div className="swym-bid-pdp swym-bid-grid product-card--add-to-cart-button button" style={available ? { display: "none" } : undefined}>Notify Me<NotifyIcon /></div>
      {!sticky && <div className="sharethis-inline-share-buttons"></div>}
      {!sticky && (
        <div className="swym-button-bar swym-isa-button-bar swym-inject swym-bbar-nomargin"><div className="swym-btn-container swym-inject" data-position="default"><button type="button" className="swym-button swym-add-to-watchlist swym-inject swym-text swym- swym-sbisa-v2 swym-loaded" style={{ display: "none" }} data-swaction="addToWatchlist" aria-label="SOLD OUT - HIT ME UP WHEN IT'S BACK!"><span className="swym-watchlist-cta">SOLD OUT - HIT ME UP WHEN IT&apos;S BACK!</span></button></div></div>
      )}
    </div>
  );
}

export default function ProductPage({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const colourIndex = product.options.findIndex((o) => /^colou?r$/i.test(o.name));
  const sizeIndex = product.options.findIndex((o) => /^size$/i.test(o.name));
  const [selected, setSelected] = useState<string[]>(product.initial);
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  // The theme initialises the gallery twice on load; the second init's select event marks the first thumbnail
  // .is-selected, so the selected thumbnail is highlighted from the start.
  const navTouched = true;
  const [narrow, setNarrow] = useState(false); // window width <= 481 (thumbnail Flickity threshold)
  const [stickyVisible, setStickyVisible] = useState(false);
  const [stickyOpen, setStickyOpen] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const atcRef = useRef<HTMLDivElement>(null);
  useSwymBar(mediaRef);

  const variant = product.variants.find((v) => v.options.every((value, i) => value === selected[i]));
  const colour = colourIndex >= 0 ? selected[colourIndex] : null;
  const images = useMemo(() => (product.galleries.find((g) => g.colour === colour) ?? product.galleries[0])?.images ?? [], [colour, product.galleries]);

  // `selected` / `select` are destructured: the returned objects also hold refs, which must not be read during render.
  const { selected: slide, select: selectGallery, rootRef: galleryRootRef, viewportRef: galleryViewportRef, sliderRef: gallerySliderRef, ...gallery } = useFlickity({ count: images.length, wrapAround: true, resetKey: colour });
  // Thumbnails become their own Flickity above 7 cells (8 at <=481px), otherwise a static row (.showthumbnailimg).
  const navCarousel = images.length > (narrow ? 8 : 7);
  const { rootRef: navRootRef, viewportRef: navViewportRef, sliderRef: navSliderRef, ...nav } = useFlickity({ count: navCarousel ? images.length : 0, wrapAround: true, resetKey: `${colour}-${navCarousel}` });
  const { selected: pairSelected, select: selectPair, rootRef: pairRootRef, viewportRef: pairViewportRef, sliderRef: pairSliderRef, ...pair } = useFlickity({ count: product.pairItWith.length, contain: true, autoPlay: PAIR_AUTOPLAY_MS });

  useEffect(() => {
    const update = () => setNarrow(window.innerWidth <= 481);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Source selects the variant from ?variant= on load and writes it back on every option change.
  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get("variant"));
    const fromUrl = product.variants.find((v) => v.id === id);
    if (fromUrl) setSelected(fromUrl.options); // eslint-disable-line react-hooks/set-state-in-effect -- one-time sync from the URL on mount
  }, [product.variants]);
  const choose = (index: number, value: string) => {
    const next = selected.map((v, i) => (i === index ? value : v));
    setSelected(next);
    const match = product.variants.find((v) => v.options.every((o, i) => o === next[i]));
    if (match) window.history.replaceState(null, "", `?variant=${match.id}`);
  };

  // Sticky add-to-cart appears once the main add-to-cart button has scrolled above the viewport.
  useEffect(() => {
    const el = atcRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // CM / IN switch inside the measurements panel (source togglesizenew): swaps .activetogglesize.
  const onPanelsClick = (e: React.MouseEvent) => {
    const toggle = (e.target as HTMLElement).closest(".togglesize");
    if (!toggle) return;
    window.setTimeout(() => {
      const checked = !!toggle.querySelector<HTMLInputElement>("input")?.checked;
      const root = toggle.closest(".prod-measurement-accordion");
      root?.querySelectorAll(".cmdescription").forEach((n) => n.classList.toggle("activetogglesize", !checked));
      root?.querySelectorAll(".inchdescription").forEach((n) => n.classList.toggle("activetogglesize", checked));
    });
  };

  // MOCK add to bag (docs/mock-behaviors.md "Cart"): local cart service, then the cart drawer opens.
  const addToBag = () => {
    if (!variant?.available) return;
    localCart.add({ handle: product.handle, title: product.title, image: images[0]?.thumb ?? "", price: parsePrice(product.priceText), colour: colour ?? "", size: sizeIndex >= 0 ? selected[sizeIndex] : null });
    openCartDrawer();
  };
  // PREVIEW quick view: the source opens a product drawer; until that drawer exists the card opens its product page.
  const quickView = (card: ProductCard) => router.push(card.imageHref);

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const selectSlide = (i: number) => selectGallery(i, { user: true });
  const sku = variant?.sku ?? "";

  return (
    <div className="template-product swym-ready swym-buttons-loaded animations-false button-uppercase-false navigation-uppercase-true product-title-uppercase-false">
      {/* Source ancestors body > #wrapper > #main-content: two source rules depend on them for their specificity. */}
      <div id="wrapper"><div id="main-content">
      <div id={`shopify-section-template--22834210603287__breadcrumbs`} className="shopify-section breadcrumbs-section">
        <scroll-shadow><nav className="breadcrumbs" aria-label="breadcrumbs"><Link href="/" title="Home">Home</Link><i>/</i>{product.title}</nav></scroll-shadow>
      </div>
      <section id={`shopify-section-${SECTION}`} className="shopify-section product-section">
        <div className="pdp-section thb-product-detail product">
          <div className="row full-width-row">
            <div className="small-12 columns">
              <div className="product-grid-container">
                <div id={`MediaGallery-${SECTION}`} data-hide-variants="true">
                  <div className="product-image-container" ref={mediaRef}>
                    <div className="swym-wishlist-button-custom-pdp">
                      <button type="button" className="jsc-copy-button" onClick={copyLink}><img src="/assets/source/share-button-outline.png" aria-label="share button outline icon" alt="share button outline icon" /></button>
                      <div className={`success-copy-message${copied ? " show" : ""}`}>Link copied</div>
                      {/* MOCK wishlist (docs/mock-behaviors.md "Wishlist"). */}
                      <WishlistButton label="Save it for later" />
                    </div>
                    <product-slider id="Product-Slider" className="product-slider-pdp product-images product-images--collage flickity-enabled is-draggable" data-captions="false" tabIndex={0} ref={galleryRootRef} {...gallery.rootHandlers}>
                      <div className="flickity-viewport" ref={galleryViewportRef} style={gallery.viewportStyle} {...gallery.viewportHandlers}>
                        <div className="flickity-slider" ref={gallerySliderRef}>
                          {images.map((img, k) => {
                            const active = k === slide;
                            // Source: the first slide is <picture><img src=2000w> without srcset; the others carry srcset/sizes, loading eager.
                            const media = k === 0
                              ? <img src={img.src} width={2000} height={Math.round(20 * img.ratio)} alt={img.alt} />
                              : <img src={img.src} alt={img.alt} srcSet={img.srcset} width={2000} height={Math.round(20 * img.ratio)} loading="eager" sizes={img.sizes} />;
                            return (
                              <div key={img.src} id={`Slide-${SECTION}-${k}`} className={`product-images__slide product-images__slide--image${k === 0 ? " product-images__slide-item--variant" : ""}${active ? " is-active" : ""} flickity-cell${active ? " is-selected" : ""}`} data-img-alt={img.alt} aria-hidden={active ? undefined : true}>
                                <div className="product-single__media product-single__media-image aspect-ratio aspect-ratio--adapt" id={`Media-Thumbnails-${SECTION}-${k}`} style={{ "--padding-bottom": `${img.ratio}%` } as React.CSSProperties}>
                                  {k === 0 ? <picture>{media}</picture> : media}
                                  <a href={img.src} className="product-single__media-zoom" data-w={2000} data-h={Math.round(20 * img.ratio)} target="_blank" rel="noreferrer" tabIndex={-1} data-index={k} aria-label="Zoom" onClick={(e) => { e.preventDefault(); setLightbox(k); }}><ZoomIcon /></a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </product-slider>
                    {navCarousel ? (
                      <div className="selectedNav text-center flickity-enabled is-draggable" tabIndex={0} ref={navRootRef} {...nav.rootHandlers}>
                        <div className="flickity-viewport" ref={navViewportRef} style={nav.viewportStyle} {...nav.viewportHandlers}>
                          <div className="flickity-slider" ref={navSliderRef}>
                            {images.map((img, k) => (
                              <div key={img.src} className={`navCell flickity-cell${navTouched && k === slide ? " is-selected" : ""}`} data-img-alt={img.alt} onClick={() => selectSlide(k)}>
                                <picture><img src={img.src} className="full-width" width={2000} height={Math.round(20 * img.ratio)} alt={img.alt} /></picture>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="selectedNav text-center showthumbnailimg">
                        {images.map((img, k) => (
                          <div key={img.src} className={`navCell${navTouched && k === slide ? " is-selected" : ""}`} data-img-alt={img.alt} style={{}} onClick={() => selectSlide(k)}>
                            <picture><img src={img.src} className="full-width" width={2000} height={Math.round(20 * img.ratio)} alt={img.alt} /></picture>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="product-images-buttons no-js-hidden">
                      <button type="button" className="slider-button slider-button--prev" name="previous" disabled={slide === 0} onClick={() => selectSlide(slide - 1)}><ArrowIcon dir="prev" /></button>
                      <div className="slider-counter caption">
                        <span className="slider-counter--current">{slide + 1}</span>
                        <span aria-hidden="true"> / </span>
                        <span className="slider-counter--total">{product.slideCount}</span>
                      </div>
                      <button type="button" className="slider-button slider-button--next" name="next" onClick={() => selectSlide(slide + 1)}><ArrowIcon dir="next" /></button>
                    </div>
                  </div>
                </div>
                <div className="product-information">
                  <div id={`ProductInfo-${SECTION}`} className="product-information--inner production-information--sticky pdp-section-info">
                    <div className="jsc-question-popup-overlay"></div>
                    <div className="product-title-container">
                      <div className="label-discount-code-wrap" style={{ display: "none" }}><div className="label-wrap"></div></div>
                      <h1 className="product-title uppercase--false" data-title={product.title}>{product.title}</h1>
                      <div className="product-price-container">
                        <div className="no-js-hidden" id={`price-${SECTION}`}><Price text={product.priceText} /></div>
                        <div className="product__tax caption">Tax included.{"\n"}<a href="/policies/shipping-policy">Shipping</a> calculated at checkout.{"\n"}</div>
                      </div>
                      <div className="label-qty-wrap-qv">
                        <div className="label-wrap">
                          {product.variants.flatMap((v) => v.labels.map((label) => (
                            <div key={`${v.id}-${label}`} data-label-id={v.id} className={`jsc-label jsc-var-label label-${label.toLowerCase().replace(/\s+/g, "-")}`} style={v.id === variant?.id ? undefined : { display: "none" }}>{label}</div>
                          )))}
                        </div>
                      </div>
                      <input type="hidden" name="quantity" form={`product-form-${SECTION}`} value="1" />
                    </div>
                    <variant-selects id={`variant-selects-${SECTION}`} className="no-js-hidden" data-update-url="true" data-section={SECTION} data-url={`/products/${product.handle}`}>
                      <VariantFieldsets product={product} selected={selected} choose={choose} colourIndex={colourIndex} />
                    </variant-selects>
                    <div ref={atcRef}>
                      <product-form className="product-form" data-section={SECTION} data-hide-errors="false">
                        <div className="product-form__error-message-wrapper form-notification error" role="alert" hidden><ErrorIcon /><span className="product-form__error-message"></span></div>
                        <form id={`product-form-${SECTION}`} className="form" noValidate data-type="add-to-cart-form" onSubmit={(e) => { e.preventDefault(); addToBag(); }}>
                          <input type="hidden" className="variant-selected-form" name="id" value={variant?.id ?? ""} />
                          <div className="product-add-to-cart-container">
                            <div className="form-notification error" style={{ display: "none" }}></div>
                            <AddToCartHolder variant={variant} onAdd={addToBag} />
                          </div>
                        </form>
                      </product-form>
                    </div>
                    <pickup-availability className="pickup-availability-wrapper" data-root-url="/" data-variant-id={variant?.id ?? ""}></pickup-availability>
                    <div className="product-info-tabs" data-product-info-tabs="">
                      <div className="product-info-tabs__nav" role="tablist" aria-label="Product information">
                        {product.tabs.map((t, i) => (
                          <button key={t.key} type="button" className={`product-info-tabs__tab${i === tab ? " is-active" : ""}`} role="tab" id={`Tab-${t.key}-${SECTION}`} aria-selected={i === tab} aria-controls={`Panel-${t.key}-${SECTION}`} data-tab-target={t.key} data-tab-heading={t.title} onClick={() => setTab(i)}>{t.title}</button>
                        ))}
                      </div>
                      <div className="product-info-tabs__panels" ref={panelsRef} onClick={onPanelsClick}>
                        {product.tabs.map((t, i) => (
                          <div key={t.key} className={`product-info-tabs__panel rte${i === tab ? " is-active" : ""}`} role="tabpanel" id={`Panel-${t.key}-${SECTION}`} aria-labelledby={`Tab-${t.key}-${SECTION}`} data-tab-panel={t.key} data-tab-heading={t.title} hidden={i !== tab} dangerouslySetInnerHTML={{ __html: t.panelHtml.replace("{{SKU}}", sku) }} />
                        ))}
                      </div>
                    </div>
                    {product.pairItWith.length > 0 && (
                      <product-recommendations className="complementary-products no-js-hidden product-recommendations--loaded">
                        <div className="complementary-products--inner">
                          <div className="complementary-products--heading">Pair It With</div>
                          <div className="flickity-complementary flickity-enabled is-draggable" tabIndex={0} data-autoplay="" ref={pairRootRef} {...pair.rootHandlers}>
                            <div className="flickity-viewport" ref={pairViewportRef} style={pair.viewportStyle} {...pair.viewportHandlers}>
                              <div className="flickity-slider" ref={pairSliderRef}>
                                {product.pairItWith.map((card, i) => (
                                  <SourceProductCard key={card.href} card={card} idPrefix={`${SECTION}-1`} className={`flickity-cell${i === pairSelected ? " is-selected" : ""}`} ariaHidden={i === pairSelected ? undefined : true} onQuickView={quickView} />
                                ))}
                              </div>
                            </div>
                            {product.pairItWith.length > 1 && (
                              <div className="flickity-page-dots">
                                {product.pairItWith.map((card, i) => (
                                  <button key={card.href} type="button" className={`flickity-page-dot${i === pairSelected ? " is-selected" : ""}`} aria-current={i === pairSelected ? "step" : undefined} onClick={() => selectPair(i, { user: true })}>{`View slide ${i + 1}`}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </product-recommendations>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <product-add-to-cart-sticky className={`product-add-to-cart-sticky no-js-hidden${stickyVisible ? " sticky--visible" : ""}`} data-section={SECTION}>
            <button type="button" className={`product-add-to-cart-sticky--inner${stickyOpen ? " sticky-open" : ""}`} onClick={() => setStickyOpen((o) => !o)}>
              <div className="product-add-to-cart-sticky--image" id={`product-image-${SECTION}--sticky`}>{images[0] && <img width={2000} height={Math.round(20 * images[0].ratio)} src={images[0].thumb} alt={images[0].alt} />}</div>
              <div className="product-add-to-cart-sticky--info">
                <div className="product-add-to-cart-sticky--title">{product.title}</div>
                <div id={`price-${SECTION}--sticky`}><Price text={product.priceText} /></div>
              </div>
              <span className="plus"></span>
              <span className="minus"></span>
            </button>
            <div className={`product-add-to-cart-sticky--content${stickyOpen ? " active" : ""}`}>
              <variant-selects id={`variant-selects-${SECTION}--sticky`} className="no-js-hidden variant-selects--sticky" data-section={SECTION} data-url={`/products/${product.handle}`} data-sticky="1">
                <VariantFieldsets product={product} selected={selected} choose={choose} colourIndex={colourIndex} suffix="--sticky" />
              </variant-selects>
              <product-form className="product-form" data-section={SECTION}>
                <div className="product-form__error-message-wrapper form-notification error" role="alert" hidden><ErrorIcon /><span className="product-form__error-message"></span></div>
                <div className="product-add-to-cart-container">
                  <div className="form-notification error" style={{ display: "none" }}></div>
                  <AddToCartHolder variant={variant} onAdd={addToBag} sticky />
                </div>
              </product-form>
            </div>
          </product-add-to-cart-sticky>
        </div>
      </section>
      <div className="side-panel side-availability" id="Pickup-Availability"></div>
      <PhotoSwipe items={images.map((img) => ({ src: img.src, w: 2000, h: Math.round(20 * img.ratio) }))} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
      <div id="shopify-section-template--22834210603287__16625458859c68803a" className="shopify-section"></div>
      <div id="shopify-section-template--22834210603287__multicolumn_aMymiB" className="shopify-section section-multicolumn">
        {product.multicolumn && (
          <div className="multicolumnsection section-spacing">
            <div className="headerrow row"><div className="small-12 columns main-wrap">
              <div className="section-header section-header-left--true"><div className="section-header--content"><h2 className="h3">{product.multicolumn.heading}</h2></div></div>
            </div></div>
            <div className="multicolumn text-left swipe-on-mobile">
              <div className="row"><div className="small-12 columns main-wrap">
                <div className="multicolumn__inner display-type--grid">
                  <div className="multicolumn__inner-row-wrap row align-stretch no-padding grid">
                    {product.multicolumn.columns.map((col) => (
                      // The source nests the Shop link inside the column link; the HTML parser closes the outer <a>
                      // first, so the live DOM has the two links as siblings, as rendered here.
                      <div key={col.title} className={col.className}>
                        <Link href={col.href}>
                          <figure className="multicolumn__image" style={{ width: "100%" }}>
                            <div className="multicolumn__image--inner aspect-ratio aspect-ratio--adapt" style={{ "--ratio-percent": `${col.ratio}%` } as React.CSSProperties}>
                              {col.image && <img className="retina_size lazyloaded" width={col.width ?? undefined} height={col.height ?? undefined} src={col.image} alt="" loading="lazy" style={{ objectPosition: "50.0% 50.0%" }} />}
                            </div>
                          </figure>
                          <h4 className="h6">{col.title}</h4>
                          <div className="rte" dangerouslySetInnerHTML={{ __html: col.html }} />
                        </Link>
                        {col.button && <Link className="text-button" href={col.button.href}><span>{col.button.label}</span><TextButtonArrow /></Link>}
                      </div>
                    ))}
                  </div>
                </div>
              </div></div>
            </div>
          </div>
        )}
      </div>
      {product.related.length > 0 && (
        <div id={`shopify-section-${RECS}`} className="shopify-section">
          <div className="row full-width-row">
            <div className="small-12 columns">
              <product-recommendations className="product-recommendations swipe-on-mobile section-spacing-padding product-recommendations--loaded">
                <div className="section-header section-header-left--true"><div className="section-header--content"><h2 className="h3">You May Also Like</h2></div></div>
                <ul className="products collection row small-up-1 medium-up-2 large-up-6 no-padding">
                  {product.related.map((card, i) => (
                    <li key={card.href} className="columns"><SourceProductCard card={card} idPrefix={`${RECS}-${i + 1}`} onQuickView={quickView} /></li>
                  ))}
                </ul>
              </product-recommendations>
            </div>
          </div>
        </div>
      )}
      </div></div>
    </div>
  );
}
