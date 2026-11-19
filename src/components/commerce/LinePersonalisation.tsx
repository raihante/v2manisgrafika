import type { CartLine } from "@/lib/cart";

/**
 * Personalisation answers ("halaman redaksi") of a cart/order line, shown under the option summary in the cart page,
 * cart drawer, checkout and thank-you summaries. Spans only, so it can sit inside the inline `.co-item-info`.
 * Long text is clamped by CSS; the full value stays in the title tooltip.
 * MOCK: a photo answer is only the chosen file name (no upload until the backend, docs/mock-behaviors.md).
 */
export default function LinePersonalisation({ line }: { line: CartLine }) {
  // Lines stored before personalisation existed have no array.
  const answers = line.personalisation ?? [];
  if (answers.length === 0) return null;
  return (
    <span className="mg-line-perso">
      {answers.map((answer) => (
        <span key={answer.key} className="mg-line-perso__item">
          <span className="mg-line-perso__label">{answer.label}</span>
          <span className="mg-line-perso__value" title={answer.value}>{answer.value}</span>
        </span>
      ))}
    </span>
  );
}
