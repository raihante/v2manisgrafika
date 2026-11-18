"use client";
// Quantity (product minimum order) and personalisation inputs ("halaman redaksi") on the product page. Manis Grafika
// addition: the BTV source PDP has no quantity selector and no personalisation. The fields come from the product's
// CMS-owned Personalisation config. Styled after the BTV variant pickers (legend type, pill controls), round 273.
// MOCK (docs/mock-behaviors.md "Personalisation"): a photo field keeps only the chosen file name; nothing is uploaded.
import { useRef } from "react";
import type { Personalisation as Config, PersonalisationField } from "@/lib/catalog/types";
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

// Example text per field key, shown as placeholder (Yasin books are mostly ordered for a memorial or a wedding).
const PLACEHOLDER: Record<string, string> = {
  redaksi: "Contoh: Dalam rangka memperingati 40 hari wafatnya Almarhum Bapak ...",
  catatan: "Contoh: tulisan warna emas, foto di halaman pertama",
};

function PhotoField({ id, field, value, onAnswer }: { id: string; field: PersonalisationField; value: string; onAnswer: Props["onAnswer"] }) {
  const input = useRef<HTMLInputElement>(null);
  const clear = () => { if (input.current) input.current.value = ""; onAnswer(field.key, ""); };
  return (
    <div className="mg-file">
      <input ref={input} id={id} className="mg-file__input" type="file" accept="image/*" onChange={(e) => onAnswer(field.key, e.target.files?.[0]?.name ?? "")} />
      <label htmlFor={id} className="mg-file__button">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 10V1.5M3.5 5 7 1.5 10.5 5M1 9.5v2.25c0 .41.34.75.75.75h10.5c.41 0 .75-.34.75-.75V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {value ? "Ganti foto" : "Pilih foto"}
      </label>
      {value ? (
        <span className="mg-file__name">{value}<button type="button" className="mg-file__clear" onClick={clear} aria-label="Hapus foto">Hapus</button></span>
      ) : (
        <span className="mg-file__empty">Belum ada foto</span>
      )}
    </div>
  );
}

export default function Personalisation({ config, minOrder, quantity, onQuantity, answers, onAnswer }: Props) {
  const setQuantity = (value: number) => onQuantity(Math.max(minOrder, Number.isFinite(value) ? Math.round(value) : minOrder));
  return (
    <div className="mg-personalisation">
      <div className="mg-field">
        <label className="mg-label" htmlFor={`${FIELD_ID}-qty`}>Jumlah:<span className="mg-label__value">{quantity} pcs</span></label>
        <div className="mg-quantity-row">
          <div className="mg-quantity">
            <button type="button" aria-label="Kurangi jumlah" disabled={quantity <= minOrder} onClick={() => setQuantity(quantity - 1)}>−</button>
            <input id={`${FIELD_ID}-qty`} type="number" inputMode="numeric" min={minOrder} step={1} value={quantity} onChange={(e) => onQuantity(Number(e.target.value))} onBlur={(e) => setQuantity(Number(e.target.value))} />
            <button type="button" aria-label="Tambah jumlah" onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <span className="mg-field__help">Minimal {minOrder} pcs</span>
        </div>
      </div>
      {config && config.fields.length > 0 && (
        <fieldset className="mg-redaksi">
          <legend className="mg-label">Halaman Redaksi</legend>
          <p className="mg-redaksi__note">
            Gratis {config.freePages} halaman. Tambahan {formatPrice(config.extraPagePrice)} per {config.extraPageUnit} halaman.
          </p>
          {config.fields.map((field) => {
            const id = `${FIELD_ID}-${field.key}`;
            const value = answers[field.key] ?? "";
            return (
              <div key={field.key} className={`mg-field mg-field--${field.type}`}>
                <label className="mg-field__label" htmlFor={id}>
                  {field.label}
                  {!field.required && <span className="mg-field__optional"> (opsional)</span>}
                </label>
                {field.type === "photo" ? (
                  <PhotoField id={id} field={field} value={value} onAnswer={onAnswer} />
                ) : field.type === "textarea" ? (
                  <textarea id={id} rows={field.required ? 4 : 2} maxLength={field.maxLength ?? undefined} required={field.required} placeholder={PLACEHOLDER[field.key]} value={value} onChange={(e) => onAnswer(field.key, e.target.value)} />
                ) : (
                  <input id={id} type="text" maxLength={field.maxLength ?? undefined} required={field.required} placeholder={PLACEHOLDER[field.key]} value={value} onChange={(e) => onAnswer(field.key, e.target.value)} />
                )}
                {(field.help || (field.type !== "photo" && field.maxLength)) && (
                  <div className="mg-field__meta">
                    {field.help && <p className="mg-field__help">{field.help}</p>}
                    {field.type !== "photo" && field.maxLength && <span className="mg-field__count">{value.length}/{field.maxLength}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
