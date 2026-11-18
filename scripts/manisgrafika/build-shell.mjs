// Build the Manis Grafika storefront shell fixtures (rebrand step 3, owner decisions 2026-11-16).
// Inputs:  reference/pre-rebrand-data/{header,layout}.json   BTV shell fixtures, used only for markup classes and the
//          sanitized source icons (copied there before the first run; never re-read from src/data, so the script is
//          idempotent)
//          src/data/collections/collections.json            collection titles (scripts/manisgrafika/build-catalog.mjs)
// Outputs: src/data/header.json    menu option A (Terbaru, Hardcover, Dompet, Mika, Tasbih) with mega menus, Indonesian
//                                  copy, Manis Grafika logo + loading GIF; the market/language selectors are removed
//          src/data/layout.json    hidden inputs (Indonesian, no free-shipping promise: MG prices exclude shipping)
//          src/data/homepage.json  only `logo`, `newsletter`, `payments`, `footer` are rewritten (`footerLinks`,
//                                  `announcement`, `navigation` BTV leftovers are dropped)
// Run: node scripts/manisgrafika/build-shell.mjs
// Contact data from manisgrafika.id (reference/manisgrafika/2026-11-16/home-content.json).
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const readJson = (path) => JSON.parse(readFileSync(`${ROOT}${path}`, "utf8"));
const json = (value) => `${JSON.stringify(value, null, 1)}\n`;

const base = readJson("reference/pre-rebrand-data/header.json");
const collections = readJson("src/data/collections/collections.json");
const MG = "/assets/manisgrafika";

const title = (handle) => {
  const c = collections[handle];
  if (!c) throw new Error(`Unknown collection: ${handle}`);
  return c.title;
};
const href = (handle) => (title(handle), `/collections/${handle}`);
const link = (label, handle) => ({ label, href: href(handle), title: label });

// ---- Menu option A ------------------------------------------------------------------------------------------------
// Category column first, series column second (source "Shop By Category" / "Shop By Collection"). Promotion photos are
// Manis Grafika product photos already in public/assets/manisgrafika/.
const MENU = [
  { label: "Terbaru", handle: "new-in" },
  {
    label: "Hardcover", handle: "hardcover", image: "DSC01992_CONVERT-scaled.webp",
    categories: [link("Standar", "hardcover-standar"), link("Bludru", "hardcover-bludru"), link("Spoon Leather", "hardcover-spoon-leather"), link("Semua Hardcover", "hardcover")],
    series: [],
  },
  {
    label: "Dompet", handle: "dompet", image: "DSC01968_CONVERT-scaled.webp",
    categories: [link("Semua Dompet", "dompet")],
    series: ["zyla-series", "shaaira-series"],
  },
  {
    label: "Mika", handle: "mika", image: "DSC06052_CONVERT-scaled.webp",
    categories: [link("Mika Kecil", "mika-kecil"), link("Mika Besar", "mika-besar"), link("Semua Mika", "mika")],
    series: ["noura-series", "zayna-series", "dayana-series", "kayla-series", "ceisya-series", "ataya-series"],
  },
  {
    label: "Tasbih", handle: "tasbih", image: "DSC01964_CONVERT-scaled.webp",
    categories: [link("Semua Tasbih", "tasbih")],
    series: ["soraya-series", "gamilia-series", "lamia-series"],
  },
];
const CATEGORY_HEADING = "Kategori";
const SERIES_HEADING = "Seri";

// Templates from the BTV fixture: first item is a plain link, second a mega-menu item (same for the mobile menu).
const [plainTpl, megaTpl] = base.desktopMenu;
const mobileSubTpl = base.mobileMenu.find((m) => m.kind === "submenu");
const [titleTpl, headingTpl] = mobileSubTpl.entries;
const linkTpl = mobileSubTpl.entries.find((e) => e.kind === "link");

const promotion = (item) => ({
  ...megaTpl.mega.promotion,
  image: `${MG}/${item.image}`,
  imageAlt: `Koleksi ${item.label}`,
  href: href(item.handle),
  target: null,
  title: `Koleksi ${item.label}`,
  button: { ...megaTpl.mega.promotion.button, label: "Belanja Sekarang", href: href(item.handle), target: null },
});
const seriesLinks = (item) => item.series.map((h) => link(title(h), h));

const desktopMenu = MENU.map((item) => {
  if (!item.categories) return { ...plainTpl, label: item.label, href: href(item.handle), title: item.label };
  const columns = [{ heading: { label: CATEGORY_HEADING, href: "#", title: CATEGORY_HEADING }, links: item.categories }];
  if (item.series.length) columns.push({ heading: { label: SERIES_HEADING, href: "#", title: SERIES_HEADING }, links: seriesLinks(item) });
  return { ...megaTpl, label: item.label, href: href(item.handle), title: item.label, itemTitle: item.label, mega: { columns, promotion: promotion(item) } };
});

const mobileMenu = MENU.map((item) => {
  if (!item.categories) return { kind: "link", label: item.label, href: href(item.handle), title: item.label };
  const entries = [{ ...titleTpl, label: item.label }, { ...headingTpl, label: CATEGORY_HEADING }, ...item.categories.map((l) => ({ ...linkTpl, ...l }))];
  if (item.series.length) entries.push({ ...headingTpl, label: SERIES_HEADING }, ...seriesLinks(item).map((l) => ({ ...linkTpl, ...l })));
  return { ...mobileSubTpl, label: item.label, dataTitle: item.label, entries, promotion: promotion(item) };
});

// ---- Header -------------------------------------------------------------------------------------------------------
const TEAL = "#2B5865";
const recolour = (icon) => ({ ...icon, inner: icon.inner.replace(/#27BFEF/gi, TEAL) }); // BTV blue search glyph
const accountLabels = { "Sign In": "Masuk", "Need Help?": "Butuh Bantuan?", "Store Locator": "Hubungi Kami", Wishlist: "Wishlist", Login: "Masuk" };
const accountLinks = base.accountLinks.map((l) => {
  const label = accountLabels[l.label];
  if (!label) throw new Error(`Untranslated account link: ${l.label}`);
  const out = { ...l, label, title: l.title ? label : l.title };
  if (l.label === "Store Locator") out.href = "/pages/contact-us"; // BTV store locator is not part of the MG site
  // BTV pixel-heart glyph (red squares) -> plain heart in Manis Grafika pink.
  if (l.label === "Wishlist" && l.icon) {
    out.icon = {
      props: { width: "20", height: "20", className: "wishlist-icon-new", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
      inner: '<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill="#CC3366"></path>',
    };
  }
  return out;
});

const { stores: _stores, languages: _languages, ...rest } = base;
const header = {
  ...rest,
  snapshot: "2026-11-16",
  rebrand: "Manis Grafika (scripts/manisgrafika/build-shell.mjs)",
  pageLoading: { ...base.pageLoading, image: `${MG}/Logo-Manis-NEW-1.gif`, alt: "Memuat" },
  announcement: {
    ...base.announcement,
    items: [
      { text: "MINIMAL PEMESANAN 50 PCS, GRATIS 5 HALAMAN REDAKSI", href: "/pages/faqs", target: null },
      { text: "PRODUKSI 6–8 HARI KERJA SETELAH DESAIN DISETUJUI", href: "/pages/faqs", target: null },
      { text: "DIKIRIM DARI SURAKARTA KE SELURUH INDONESIA", href: "/pages/kebijakan-pengiriman", target: null },
      null,
    ],
  },
  logo: {
    alt: "Manis Grafika",
    width: 744,
    height: 225,
    images: [
      { src: `${MG}/manis-grafika-logo-teal.png`, className: "logoimg" },
      { src: `${MG}/manis-grafika-logo-teal.png`, className: "logoimg logoimg--light" },
      { src: `${MG}/manis-grafika-logo-white.png`, className: "logoimg jsc-secondary-logo d-none" },
    ],
  },
  hamburgerBack: { ...base.hamburgerBack, label: "Kembali" },
  desktopMenu,
  mobileMenu,
  accountLinks,
  secondary: {
    ...base.secondary,
    search: { ...base.secondary.search, icon: recolour(base.secondary.search.icon) },
    account: { ...base.secondary.account, title: "Akun Saya" },
  },
  searchBar: { ...base.searchBar, placeholder: "Cari", submitIcon: recolour(base.searchBar.submitIcon) },
  sidePanels: {
    ...base.sidePanels,
    cart: {
      ...base.sidePanels.cart,
      title: "Keranjang Belanja",
      empty: "Keranjang Anda masih kosong.",
      desc: { ...base.sidePanels.cart.desc, text: "Pengiriman ke seluruh Indonesia", iconAlt: "ikon pengiriman" },
      suggestionTitle: "Rekomendasi belanja",
      pills: [link("Terbaru", "new-in"), link("Hardcover", "hardcover"), link("Mika", "mika")].map((l) => ({ ...l, title: null })),
      continue: { label: "Lanjut Belanja", href: href("new-in"), title: null },
    },
    product: { title: "Pilih opsi" },
    search: { placeholder: "Cari apa saja", label: "Cari" },
  },
  // Promo popup (was the BTV "Backstage pass" popup). Owner 2026-11-17: placeholder Manis Grafika copy, hidden for now.
  // Set enabled: true (CMS field) once the client supplies a real promotion.
  promoPopup: {
    enabled: false,
    placeholder: true,
    delayMs: 3000,
    image: `${MG}/DSC01973_CONVERT-scaled.webp`,
    imageAlt: "Paket Yasin Manis Grafika",
    title: "Promo Spesial Manis Grafika",
    subtitle: "[Placeholder] Penawaran khusus untuk pemesanan paket Yasin pertama Anda. Detail promo menyusul.",
    button: { label: "Lihat Promo", href: href("new-in") },
  },
};

// ---- Layout hidden inputs (source cart-script copy; MG has no free-shipping offer) ---------------------------------
const layout = {
  source: "Hidden inputs at the top of #main-content; Manis Grafika copy 2026-11-16",
  hiddenInputs: [
    { id: "jsc-front-shipping-text-local", value: "Ongkos kirim dihitung saat checkout." },
    { id: "jsc-back-shipping-text-local", value: "Dikirim dari Surakarta." },
    { id: "jsc-front-shipping-text-int", value: "Ongkos kirim dihitung saat checkout." },
    { id: "jsc-back-shipping-text-int", value: "Dikirim dari Surakarta." },
  ],
};

// ---- Footer, newsletter, payments, checkout logo -------------------------------------------------------------------
const WHATSAPP = "6281947949888";
const footer = {
  groups: [
    { title: "Manis Grafika", links: [{ text: "Tentang Kami", href: "/pages/about-us" }, { text: "Blog", href: "/blogs" }, { text: "Hubungi Kami", href: "/pages/contact-us" }] },
    { title: "Belanja", links: MENU.map((m) => ({ text: m.label, href: href(m.handle) })) },
    {
      title: "Bantuan",
      links: [
        { text: "FAQ", href: "/pages/faqs" },
        { text: "Pengiriman", href: "/pages/kebijakan-pengiriman" },
        { text: "Pengembalian", href: "/pages/returns" },
        { text: "Syarat & Ketentuan", href: "/pages/terms-of-service" },
        { text: "Kebijakan Privasi", href: "/pages/privacy-policy" },
      ],
    },
    {
      title: "Kontak",
      links: [
        // Label + small value (owner 2026-11-17); the full address is on /pages/contact-us.
        { text: "WhatsApp", note: "+62 819 4794 9888", href: `https://wa.me/${WHATSAPP}` },
        { text: "Email", note: "manisgrafika@gmail.com", href: "mailto:manisgrafika@gmail.com" },
        { text: "Alamat", note: "Ps. Kliwon, Surakarta", href: "https://www.google.com/maps/search/?api=1&query=Manis+Grafika+Jl.+Kapten+Mulyadi+Kedung+Lumbu+Surakarta" },
      ],
    },
  ],
  // Monochrome circle icons (512px). Shopee: official glyph via Simple Icons (source shopee.com); Tokopedia: official
  // app icon from tokopedia.com, converted to the same monochrome style (docs/asset-manifest.md). The Tokopedia shop URL
  // is the "archive-" shop linked from manisgrafika.id (owner: keep it for now).
  social: [
    { text: "Instagram", icon: "/assets/social-icons/instagram.png", href: "https://www.instagram.com/manisgrafika/" },
    { text: "TikTok", icon: "/assets/social-icons/tiktok.png", href: "https://www.tiktok.com/@manis_grafika" },
    { text: "Shopee", icon: "/assets/social-icons/shopee.svg", href: "https://shopee.co.id/manis_grafika" },
    { text: "Tokopedia", icon: "/assets/social-icons/tokopedia.png", href: "https://www.tokopedia.com/archive-manisgrafika-1683333075" },
  ],
  copyright: "© Manis Grafika",
  paymentsTitle: "Manis Grafika menerima",
};

const homepage = readJson("src/data/homepage.json");
delete homepage.footerLinks;
delete homepage.announcement;
delete homepage.navigation;
homepage.logo = `${MG}/manis-grafika-logo-teal.png`;
homepage.footer = footer;
homepage.newsletter = {
  title: "Newsletter",
  tagline: "Jadilah yang pertama tahu!",
  placeholder: "Masukkan email Anda",
  buttonText: "Daftar",
  descriptionDesktop: ["Daftar untuk info koleksi terbaru, promo eksklusif, ", "dan inspirasi buku Yasin serta paket hadiah dari Manis Grafika."],
  descriptionMobile: ["Daftar untuk info koleksi terbaru, promo eksklusif, dan inspirasi buku Yasin serta paket hadiah.", "Dari Manis Grafika untuk Anda."],
  successMessage: "Terima kasih telah berlangganan!",
};
// Payment marks: QRIS only (owner decision 2026-11-17).
homepage.payments = [{ name: "QRIS", image: "/assets/payments/payment-qris.webp" }];

writeFileSync(`${ROOT}src/data/header.json`, json(header));
writeFileSync(`${ROOT}src/data/layout.json`, json(layout));
writeFileSync(`${ROOT}src/data/homepage.json`, json(homepage));
console.log(`header: ${desktopMenu.length} menu items; footer: ${footer.groups.length} groups, ${footer.social.length} social links`);
