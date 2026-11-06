// /pages/contact-us in the source template markup (template page.contact, theme t/33, 2026-11-06): rich-text header
// image, the custom-liquid form embed (MOCK form document in an iframe), and the multicolumn contact details.
import LazySizesImage from "@/components/shared/LazySizesImage";
import FormEmbedFrame from "@/components/pages/FormEmbedFrame";
import type { ContactPageData } from "@/lib/pages/contact";

/** "a: 1; b: 2" -> React style object (declarations with an empty value are dropped, as browsers drop them). */
export function inlineStyle(css: string): React.CSSProperties {
  const camel = (k: string) => (k.startsWith("--") ? k : k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()));
  return Object.fromEntries(css.split(";").map((d) => d.split(":")).filter(([k, ...v]) => k?.trim() && v.join(":").trim()).map(([k, ...v]) => [camel(k.trim()), v.join(":").trim()])) as React.CSSProperties;
}

export default function ContactPage({ page }: { page: ContactPageData }) {
  const { richText: rt, form, multicolumn: mc } = page;
  return (
    <>
      <div id={`shopify-section-${rt.sectionId}`} className="shopify-section">
        <div className="row grid">
          <div className="small-12 columns">
            <div className={rt.className} style={inlineStyle(rt.style)}>
              <div className="rich-text__inner">
                <div className={rt.innerClass}>
                  <LazySizesImage src={rt.placeholder} srcset={rt.srcset.map((s) => `${s.src} ${s.w}w`).join(", ")} width={rt.width} height={rt.height} alt={rt.alt} className={rt.imgClass} style={inlineStyle(rt.imgStyle)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section id={`shopify-section-${form.sectionId}`} className={form.className}>
        <div style={inlineStyle(form.divStyle)} className={form.divClass} id={form.divId}>
          <FormEmbedFrame id={form.iframeId} formId={form.divId} src={form.src} title={form.title} width={form.width} frameBorder={form.frameborder} initialHeight={form.initialHeight} />
        </div>
      </section>
      <div id={`shopify-section-${mc.sectionId}`} className={mc.className}>
        <div className="multicolumnsection section-spacing">
          <div className="headerrow row"><div className="small-12 columns main-wrap"> </div></div>
          <div className="multicolumn text-left section-spacing--disable-top">
            <div className="row">
              <div className="small-12 columns main-wrap">
                <div className="multicolumn__inner display-type--grid">
                  <div className="multicolumn__inner-row-wrap row align-stretch no-padding grid">
                    {mc.columns.map((c) => (
                      <div key={c.title} className={c.className}>
                        <h4 className="h5">{c.title}</h4>
                        {/* Source rich text (CMS field): links and line breaks as the source writes them. */}
                        <div className="rte" dangerouslySetInnerHTML={{ __html: c.html }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
