"use client";
// Quantity (product minimum order) and personalisation inputs ("halaman redaksi") on the product page. Manis Grafika
// addition: the BTV source PDP has no quantity selector and no personalisation. The fields come from the product's
// CMS-owned Personalisation config.
// MOCK (docs/mock-behaviors.md "Personalisation"): a photo field keeps only the chosen file name; nothing is uploaded.
import type { Personalisation as Config } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/catalog/format";

type Props = {
  config: Config | null;
  minOrder: number;
  quantity: number;
  onQuantity: (quantity: number) => void;
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
};

const FIELD_ID = "mg-personalisation";

export default function Personalisation({ config, minOrder, quantity, onQuantity, answers, onAnswer }: Props) {
  const setQuantity = (value: number) => onQuantity(Math.max(minOrder, Number.isFinite(value) ? Math.round(value) : minOrder));
  return (
    <div className="mg-personalisation">
      <div className="mg-field">
        <label className="form__label" htmlFor={`${FIELD_ID}-qty`}>Jumlah (pcs)</label>
        <div className="mg-quantity">
          <button type="button" aria-label="Kurangi jumlah" disabled={quantity <= minOrder} onClick={() => setQuantity(quantity - 1)}>−</button>
          <input id={`${FIELD_ID}-qty`} type="number" inputMode="numeric" min={minOrder} step={1} value={quantity} onChange={(e) => onQuantity(Number(e.target.value))} onBlur={(e) => setQuantity(Number(e.target.value))} />
          <button type="button" aria-label="Tambah jumlah" onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
        <p className="mg-field__help">Minimal pembelian {minOrder} pcs.</p>
      </div>
      {config && config.fields.length > 0 && (
        <fieldset className="mg-redaksi">
          <legend className="form__label">Halaman Redaksi</legend>
          <p className="mg-field__help">
            Gratis {config.freePages} halaman redaksi. Tambahan {formatPrice(config.extraPagePrice)} per {config.extraPageUnit} halaman.
          </p>
          {config.fields.map((field) => {
            const id = `${FIELD_ID}-${field.key}`;
            const label = <label htmlFor={id}>{field.label}{field.required ? " *" : ""}</label>;
            return (
              <div key={field.key} className={`mg-field mg-field--${field.type}`}>
                {label}
                {field.type === "photo" ? (
                  <>
                    <input id={id} type="file" accept="image/*" onChange={(e) => onAnswer(field.key, e.target.files?.[0]?.name ?? "")} />
                    {answers[field.key] && <span className="mg-field__file">{answers[field.key]}</span>}
                  </>
                ) : field.type === "textarea" ? (
                  <textarea id={id} rows={4} maxLength={field.maxLength ?? undefined} required={field.required} value={answers[field.key] ?? ""} onChange={(e) => onAnswer(field.key, e.target.value)} />
                ) : (
                  <input id={id} type="text" maxLength={field.maxLength ?? undefined} required={field.required} value={answers[field.key] ?? ""} onChange={(e) => onAnswer(field.key, e.target.value)} />
                )}
                {field.help && <p className="mg-field__help">{field.help}</p>}
              </div>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
