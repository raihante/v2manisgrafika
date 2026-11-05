import icons from "@/data/pdp-icons.json";

// SVG icons copied from the source product page markup (theme snippets), kept byte-equivalent where possible.
const ZOOM = ["M12.375 4.0625H15.9375V7.625", "M11.7812 8.21875L15.9375 4.0625", "M7.625 15.9375H4.0625V12.375", "M8.21875 11.7812L4.0625 15.9375"];
const stroke = { stroke: "var(--color-body)", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const ZoomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">{ZOOM.map((d) => <path key={d} d={d} {...stroke} />)}</svg>
);

export const ArrowIcon = ({ dir }: { dir: "prev" | "next" }) => (
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={dir === "prev" ? "M5 1L1 5L5 9" : "M1 1L5 5L1 9"} stroke="var(--color-body, #151515)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Spinner = () => (
  <svg aria-hidden="true" focusable="false" role="presentation" className="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
    <circle className="spinner-path" fill="none" strokeWidth="6" cx="33" cy="33" r="30" stroke="var(--color-accent)" />
  </svg>
);

export const ErrorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="9" fill="#E93636" />
    <path d="M9 5V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 13C9.55228 13 10 12.5523 10 12C10 11.4477 9.55228 11 9 11C8.44772 11 8 11.4477 8 12C8 12.5523 8.44772 13 9 13Z" fill="white" />
  </svg>
);

// Swym wishlist heart (theme snippet: outline = not added, filled = added) plus the pixel-heart GIFs it animates with.
// Heart paths copied verbatim from the source card markup (src/data/pdp-icons.json).
export function WishlistIcons() {
  return (
    <>
      <svg width="20" height="20" className="wishlist-not-added-icon" xmlns="http://www.w3.org/2000/svg" id="Layer_1" viewBox="0 0 47.33 44.03">
        <path className="cls-1" d={icons.heartOutline} />
      </svg>
      <picture>
        <img src="/assets/source/PIXEL_HEART.gif" alt="" className="heartfloat" />
        <img src="/assets/source/HEART_FILL.gif" alt="" className="heartfill" />
      </picture>
      <svg width="20" height="20" className="wishlist-added-icon" xmlns="http://www.w3.org/2000/svg" id="Layer_1" viewBox="0 0 47.33 44.03">
        <path className="cls-1" d={icons.heartFilled} />
      </svg>
    </>
  );
}

export const TextButtonArrow = () => (
  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.799805 5.5H12.7998" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.49976 1L13.9998 5.5L9.49976 10" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
