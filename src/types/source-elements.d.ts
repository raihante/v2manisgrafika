// Custom elements the source theme mounts (product page, product cards). The clone renders the same tag names so the
// DOM hierarchy and the ported source CSS selectors match; behaviour comes from React, not from the theme's scripts.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type SourceElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { [data: `data-${string}`]: string | number | boolean | undefined };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "scroll-shadow": SourceElement;
      "product-slider": SourceElement;
      "variant-selects": SourceElement;
      "product-form": SourceElement;
      "pickup-availability": SourceElement;
      "product-recommendations": SourceElement;
      "product-card": SourceElement;
      "quick-view": SourceElement;
      "product-add-to-cart-sticky": SourceElement;
    }
  }
}
