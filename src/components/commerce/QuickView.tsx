"use client";
// Card quick view (round 282): the content of #Product-Drawer-Content after a card "Tambah Keranjang" click, built on
// the source product-quick-view section (reference/dom/r282-quickview/Product-Drawer-Content-*.html):
// .thb-product-detail > .product-quick-images--container (slides + .selectedNav thumbnails) + .product-information--inner
// (title, price, variant-selects, product-form). The .template-product wrapper lets the ported PDP rules
// (pdp-source.css, brand.css) style the form exactly like the product page. Manis Grafika: the form also holds the
// quantity and the "halaman redaksi" fields, so the customer can add straight from the drawer (owner 2026-11-19).
import Link from "next/link";
import { useRef } from "react";
import type { QuickViewProduct } from "@/lib/catalog/types";
import Personalisation from "./pdp/Personalisation";
import { ErrorIcon } from "./pdp/icons";
import { AddToCartHolder, Price, VariantFieldsets, usePurchase } from "./pdp/purchase";

// Section id of the source quick-view template (data-section of its variant-selects / product-form).
const SECTION = "template--22799925543191__main";
const ID_PREFIX = "mg-quick-view";

export default function QuickView({ product, initialVariantId, onClose }: { product: QuickViewProduct; initialVariantId: number | null; onClose: () => void }) {
  const { colourIndex, selected, choose, variant, priceText, compareAtText, images, quantity, setQuantity, answers, answer, formError, invalidKey, addToBag } = usePurchase(product, {
    idPrefix: ID_PREFIX,
    initialVariantId,
    onAdded: onClose,
  });
  const slidesRef = useRef<HTMLDivElement>(null);
  const href = `/products/${product.handle}${variant ? `?variant=${variant.id}` : ""}`;

  // Thumbnail click: bring that slide into view inside the image strip (horizontal below 1068px, vertical above)
  // without scrolling the drawer or the page.
  const showSlide = (index: number) => {
    const strip = slidesRef.current;
    const slide = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !slide) return;
    const box = strip.scrollHeight > strip.clientHeight ? strip : (strip.parentElement as HTMLElement);
    box.scrollTo({ left: slide.offsetLeft - strip.offsetLeft, top: slide.offsetTop - strip.offsetTop, behavior: "smooth" });
  };

  return (
    <div className="template-product mg-quick-view">
      <div className="thb-product-detail product">
        <div className="product-quick-images--container active">
          <div className="product-quick-images" id={`MediaGallery-${SECTION}`} ref={slidesRef}>
            {images.map((image, i) => (
              <div key={image.src} className={`product-quick-images__slide product-images__slide--image${i === 0 ? " is-active" : ""}`} id={`Slide-${SECTION}-${i + 1}`}>
                <div className="product-single__media product-single__media-image">
                  <picture><img src={image.src} srcSet={image.srcset || undefined} sizes={image.srcset ? "(min-width: 1068px) 400px, 280px" : undefined} alt={image.alt} loading={i < 2 ? "eager" : "lazy"} /></picture>
                </div>
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <div className="selectedNav text-center showthumbnailimg">
              {images.map((image, i) => (
                <button key={image.src} type="button" className="navCell" aria-label={`Lihat foto ${i + 1}`} onClick={() => showSlide(i)}>
                  <picture><img src={image.thumb} alt="" className="full-width" loading="lazy" /></picture>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-information--inner" id={`ProductInfo-${SECTION}`}>
          <div className="product-title-container">
            <Link className="product-title uppercase--true" href={href} onClick={onClose}>{product.title}</Link>
            <div className="product-price-container">
              <div className="no-js-hidden" id={`price-${SECTION}`}><Price text={priceText} compareAt={compareAtText} /></div>
              <div className="product__tax caption">Harga belum termasuk ongkos kirim.</div>
            </div>
          </div>
          <variant-selects className="no-js-hidden jsc-qv-var-wrap" id={`variant-selects-${SECTION}`} data-section={SECTION}>
            <VariantFieldsets product={product} selected={selected} choose={choose} colourIndex={colourIndex} section={SECTION} />
          </variant-selects>
          <div>
            <product-form className="product-form product-form-qv" data-section={SECTION}>
              <form id={`product-form-${SECTION}`} className="form" noValidate data-type="add-to-cart-form" onSubmit={(e) => { e.preventDefault(); addToBag(); }}>
                <input type="hidden" className="variant-selected-form" name="id" value={variant?.id ?? ""} />
                <Personalisation config={product.personalisation} minOrder={product.minOrder} quantity={quantity} onQuantity={setQuantity} answers={answers} onAnswer={answer} invalidKey={invalidKey} idPrefix={ID_PREFIX} />
                {formError && <div className="form-notification error mg-form-error" role="alert"><ErrorIcon /><span>{formError}</span></div>}
                <div className="product-add-to-cart-container">
                  <AddToCartHolder variant={variant} onAdd={addToBag} buttonId="AddToCartQuickView" />
                </div>
              </form>
            </product-form>
          </div>
        </div>
      </div>
    </div>
  );
}
