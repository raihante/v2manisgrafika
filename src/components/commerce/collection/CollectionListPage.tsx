/* eslint-disable @next/next/no-img-element -- source <noscript> fallback uses a plain <img> */
// /collections in the source template markup (template list-collections, section main, theme t/33, 2026-11-06):
// section header "SHOP BY CATEGORY" and the collection-card grid (style1), images driven by lazysizes.
import LazySizesImage from "@/components/shared/LazySizesImage";
import type { CollectionList } from "@/lib/collections/list";

/** "--a: 1; --b: 2" -> React style object (declarations with an empty value are dropped, as browsers drop them). */
function inlineStyle(css: string): React.CSSProperties {
  return Object.fromEntries(css.split(";").map((d) => d.split(":")).filter(([k, ...v]) => k?.trim() && v.join(":").trim()).map(([k, ...v]) => [k.trim(), v.join(":").trim()])) as React.CSSProperties;
}

export default function CollectionListPage({ list }: { list: CollectionList }) {
  return (
    <div id={`shopify-section-${list.sectionId}`} className={list.sectionClass}>
      <div className="row full-width-row">
        <div className="small-12 columns">
          <div className={list.listClass} style={inlineStyle(list.listStyle)}>
            {/* Source style="background-color: ;" has no value, so browsers ignore it; not reproduced. */}
            <div className={list.headerClass}>
              <div className="section-header--content"><h2 className={list.headingClass}>{list.heading}</h2></div>
            </div>
            <div className={list.rowClass} style={inlineStyle(list.rowStyle)}>
              <div className="small-12 columns">
                <div className="collection-grid">
                  {list.cards.map((card) => {
                    const srcset = card.srcset.map((s) => `${s.src} ${s.w}w`).join(", ");
                    const largest = card.srcset.at(-1)?.src ?? card.placeholder;
                    return (
                      <div key={card.href} className="small-12 ">
                        <div className={card.cardClass}>
                          <div className={card.imageClass} style={{ "--var-media-aspect-ratio": `${card.ratio}%` } as React.CSSProperties}>
                            <a href={card.href} className="collection-card__link" title={card.title}>
                              <LazySizesImage src={card.placeholder} srcset={srcset} width={card.width} height={card.height} alt={card.alt} />
                              {/* The source fallback requests the full-size original; the clone points it at the largest mirrored width. */}
                              <noscript><img width={card.width} height={card.height} sizes="auto" src={largest} srcSet={srcset} alt={card.alt} fetchPriority="low" loading="lazy" /></noscript>
                            </a>
                          </div>
                          <div className="collection-card__content">
                            <a href={card.href} className="collection-card__link" title={card.title}>{`${card.label} `}</a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
