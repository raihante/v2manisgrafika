"use client";
// Purchase form shared by the product page and the card quick-view drawer (#Product-Drawer): price, option fieldsets,
// add-to-cart button and the state behind them (variant choice, quantity, personalisation, validation, add to the
// MOCK local cart). Markup follows the source main-product / product-quick-view sections so the ported PDP CSS applies
// in both places. Moved out of ProductPage.tsx in round 282.
import { useMemo, useState } from "react";
import { openCartDrawer } from "@/components/Overlays";
import { localCart, type CartPersonalisation } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog/format";
import type { QuickViewProduct, ProductVariant } from "@/lib/catalog/types";
import { PERSONALISATION_ID } from "./Personalisation";
import { ErrorIcon, Spinner } from "./icons";

const parsePrice = (text: string) => Number(text.replace(/[^0-9]/g, "")) || 0;

// Sale price: the regular price struck through before the current price (Manis Grafika compare-at price).
export const Price = ({ text, compareAt = null }: { text: string; compareAt?: string | null }) => (
  <span className={`price${compareAt ? " price--on-sale" : ""}`}>
    {compareAt && <del className="price__compare"><span className="amount">{compareAt}</span></del>}
    <span className={`amount${compareAt ? " price__sale" : ""}`}> {text}</span>
    <small className="unit-price  hidden"><span></span><span className="unit-price-separator">/</span><span></span></small>
  </span>
);

type OptionsProps = {
  product: QuickViewProduct;
  selected: string[];
  choose: (index: number, value: string) => void;
  colourIndex: number;
  /** Source section id: radio ids and the form they belong to (`product-form-<section>`). */
  section: string;
  suffix?: string;
};

// variant-selects > .variations > fieldset per option, radios + labels exactly as the theme renders them (colour
// categories such as Classic / Seasonal get their own label + swatch group; the label value shows only in the
// group that holds the selected colour).
export function VariantFieldsets({ product, selected, choose, colourIndex, section, suffix = "" }: OptionsProps) {
  return (
    <div className="variations">
      {product.options.map((option, index) => {
        const isColour = index === colourIndex;
        // Round 281 (owner): availability cascades in option order (Cover -> Jenis Kertas -> Jumlah Halaman). A value
        // looks disabled (faded, dashed) only when no in-stock variant has it together with the selections of the
        // options BEFORE it: a cover with no stock at all; a paper with no stock in any page count for the chosen
        // cover; a page count that is not offered / out of stock for the chosen cover + paper. Style only (class, no
        // disabled attribute): every value stays clickable and the add button then reads "Stok Kosong".
        const disabled = (value: string) => !product.variants.some((v) => v.available && v.options[index] === value && v.options.every((o, i) => i >= index || o === selected[i]));
        const radio = (value: string) => {
          const k = option.values.indexOf(value);
          const id = `${section}-${index + 1}-${option.ids[k] ?? k}${suffix}`;
          return [
            <input key={`i-${value}`} type="radio" id={id} name={`${option.name}${suffix}`} value={value} form={`product-form-${section}`} checked={selected[index] === value} className={disabled(value) ? "is-disabled" : undefined} onChange={() => choose(index, value)} />,
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
                {/* MG: the WooCommerce colour attribute is named "Variant", so the legend says "Cover:" (round 274). */}
                <div className="form__label">Cover: <span className="form__label__value">{selected[index]}</span></div>
                {option.values.map(radio)}
              </>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

type HolderProps = {
  variant: ProductVariant | undefined;
  onAdd: () => void;
  /** Button id: AddToCart (PDP), AddToCartSticky (PDP sticky bar), AddToCartQuickView (drawer). */
  buttonId: string;
  label?: string;
  /** Full holder (pre-order notices, share and watchlist mounts) on the PDP main form; the sticky bar and the drawer
   *  only render the button and the limit notice. */
  full?: boolean;
};

export function AddToCartHolder({ variant, onAdd, buttonId, label = "Tambah Keranjang", full = false }: HolderProps) {
  const available = !!variant?.available;
  return (
    <div className="add_to_cart_holder ">
      {/* Round 281 (owner): an unavailable selection (combination not offered, or out of stock) keeps the button in
          place as a disabled red "Stok Kosong" instead of hiding it behind the source "Kabari Saya" notify button. */}
      <button type="submit" name="add" id={buttonId} className={`single-add-to-cart-button button${available ? "" : " sold-out mg-sold-out"}`} disabled={!available} onClick={(e) => { e.preventDefault(); onAdd(); }}>
        <span className="single-add-to-cart-button--text">{available ? label : "Stok Kosong"}</span>
        <span className="loading-overlay"><Spinner /></span>
      </button>
      {full && (
        <div className="jsc-preorder-notice" style={{ display: "none" }}>
          <p className="jsc-preorder-notice__ship">Dikirim mulai akhir bulan.</p>
          <p className="jsc-preorder-notice__checkout">Produk pre-order dan produk reguler tidak dapat dibeli bersamaan.</p>
        </div>
      )}
      <div className="jsc-preorder-limit-notice form-notification error" style={{ display: "none" }} role="alert"><ErrorIcon /><span>Produk pre-order ini sudah tidak tersedia.</span></div>
      {full && <div className="sharethis-inline-share-buttons"></div>}
      {full && (
        <div className="swym-button-bar swym-isa-button-bar swym-inject swym-bbar-nomargin"><div className="swym-btn-container swym-inject" data-position="default"><button type="button" className="swym-button swym-add-to-watchlist swym-inject swym-text swym- swym-sbisa-v2 swym-loaded" style={{ display: "none" }} data-swaction="addToWatchlist" aria-label="HABIS - KABARI SAYA SAAT TERSEDIA"><span className="swym-watchlist-cta">HABIS - KABARI SAYA SAAT TERSEDIA</span></button></div></div>
      )}
    </div>
  );
}

type PurchaseOptions = {
  /** Personalisation input id prefix (unique per form on the page). */
  idPrefix?: string;
  /** Variant to start from (quick view: the card's variant); the PDP syncs ?variant= itself. */
  initialVariantId?: number | null;
  /** Called after a choice that matches a variant (PDP writes ?variant=). */
  onVariantChange?: (variant: ProductVariant) => void;
  /** Called when an add is blocked, before the field is revealed (PDP closes its sticky panel). */
  onBlocked?: () => void;
  /** Called after a successful add, before the cart drawer opens (drawer closes itself). */
  onAdded?: () => void;
};

/** Variant choice, quantity, personalisation answers and the MOCK add to cart of one product form. */
export function usePurchase(product: QuickViewProduct, { idPrefix = PERSONALISATION_ID, initialVariantId = null, onVariantChange, onBlocked, onAdded }: PurchaseOptions = {}) {
  // Swatch option: BTV "Colour", Manis Grafika "Cover".
  const colourIndex = product.options.findIndex((o) => /^(colou?r|cover)$/i.test(o.name));
  const [selected, setSelected] = useState<string[]>(() => product.variants.find((v) => v.id === initialVariantId)?.options ?? product.initial);
  const [quantity, setQuantity] = useState(product.minOrder);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  /** Personalisation field key (or "qty") that blocked the last add: highlighted until the customer fixes it. */
  const [invalidKey, setInvalidKey] = useState<string | null>(null);

  const variant = product.variants.find((v) => v.options.every((value, i) => value === selected[i]));
  const priceText = variant?.price ? formatPrice(variant.price) : product.priceText;
  const compareAtText = variant?.compareAtPrice ? formatPrice(variant.compareAtPrice) : null;
  const colour = colourIndex >= 0 ? selected[colourIndex] : null;
  const images = useMemo(() => (product.galleries.find((g) => g.colour === colour) ?? product.galleries[0])?.images ?? [], [colour, product.galleries]);

  const choose = (index: number, value: string) => {
    const next = selected.map((v, i) => (i === index ? value : v));
    setSelected(next);
    const match = product.variants.find((v) => v.options.every((o, i) => o === next[i]));
    if (match) onVariantChange?.(match);
  };

  const fields = product.personalisation?.fields ?? [];
  const missingField = fields.find((f) => f.required && !answers[f.key]?.trim());
  // Blocked add: bring the field to the middle of its scroll container (page or drawer) and focus it, so the error is
  // never off-screen (round 279).
  const block = (key: string, message: string) => {
    setFormError(message);
    setInvalidKey(key);
    onBlocked?.();
    const input = document.getElementById(`${idPrefix}-${key}`);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (input?.closest(".mg-field") ?? input)?.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block: "center" });
    input?.focus({ preventScroll: true });
  };
  const answer = (key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    if (key === invalidKey && value.trim()) {
      setInvalidKey(null);
      setFormError("");
    }
  };

  // MOCK add to bag (docs/mock-behaviors.md "Cart", "Personalisation"): local cart service, then the cart drawer opens.
  const addToBag = () => {
    if (!variant?.available) return;
    if (missingField) return block(missingField.key, `Mohon isi "${missingField.label}".`);
    if (quantity < product.minOrder) return block("qty", `Minimal pembelian ${product.minOrder} pcs.`);
    setFormError("");
    setInvalidKey(null);
    const personalisation: CartPersonalisation[] = fields.filter((f) => answers[f.key]?.trim()).map((f) => ({ key: f.key, label: f.label, value: answers[f.key].trim() }));
    localCart.add({
      handle: product.handle, variantId: String(variant.id), title: product.title, image: images[0]?.thumb ?? "",
      price: variant.price || parsePrice(product.priceText),
      options: product.options.map((o, i) => ({ name: o.name, value: selected[i] })),
      personalisation, minQuantity: product.minOrder,
    }, quantity);
    onAdded?.();
    openCartDrawer();
  };

  return {
    colourIndex, selected, setSelected, choose, variant, priceText, compareAtText, colour, images,
    quantity, setQuantity, answers, answer, formError, invalidKey, missingField, addToBag, idPrefix,
  };
}
