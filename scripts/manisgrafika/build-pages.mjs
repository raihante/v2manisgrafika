// Build the Manis Grafika content pages and blog fixtures (rebrand step 5, owner decisions 2026-11-16/17).
// Inputs:  reference/pre-rebrand-data/pages/{faqs,contact-us,wishlist}.json   BTV fixtures, used only for section ids,
//          markup classes and the source template structure (never for copy; script is idempotent)
//          Manis Grafika copy: manisgrafika.id (homepage FAQ, Tentang Kami page and artboards, product descriptions),
//          captured in reference/manisgrafika/2026-11-16/ and transcribed below
// Outputs: src/data/pages/content/{about-us,terms-of-service,privacy-policy,returns,kebijakan-pengiriman}.json
//          src/data/pages/{faqs,contact-us,wishlist}.json
//          src/data/blogs/{blogs,bodies}.json        BTV articles removed; 3 labelled placeholder articles
// Run: node scripts/manisgrafika/build-pages.mjs   (after scripts/manisgrafika/build-page-banners.py)
//
// Policy pages are AGENT DRAFTS of standard Indonesian e-commerce policies, built only from facts Manis Grafika
// publishes (minimum order, halaman redaksi, 6-8 working days, ships from Surakarta, prices exclude shipping) and owner
// decisions (QRIS payment). Each page opens with a visible draft notice; client/legal review is required before launch.
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const readJson = (path) => JSON.parse(readFileSync(`${ROOT}${path}`, "utf8"));
const json = (value) => `${JSON.stringify(value, null, 1)}\n`;
const write = (path, value) => writeFileSync(`${ROOT}${path}`, json(value));

const MG = "/assets/manisgrafika";
const ACCENT = "rgb(43, 88, 101)"; // logo teal #2B5865
const WA = "https://wa.me/6281947949888";
const WA_LABEL = "+62 819 4794 9888";
const EMAIL = "manisgrafika@gmail.com";
const ADDRESS = "Jl. Kapten Mulyadi, Kedung Lumbu, Kec. Ps. Kliwon (Lantai 2 Kios No. 3), Kota Surakarta, Jawa Tengah";
const MAPS = "https://www.google.com/maps/search/?api=1&query=Manis+Grafika+Jl.+Kapten+Mulyadi+Kedung+Lumbu+Surakarta";
const UPDATED = "17 November 2026";

const p = (...lines) => lines.map((l) => `<p>${l}</p>`).join("");
const rich = (html, variant = "body") => ({ type: "richText", variant, html });
const heading = (text) => ({ type: "heading", html: text, align: "left" });
const list = (items, ordered = false) => ({ type: "list", ordered, items });
const img = (file, alt, width, height) => ({ src: `${MG}/${file}`, alt, width, height });
const draftNotice = {
  type: "callout",
  title: "Draf",
  html: p(`Halaman ini adalah draf kebijakan standar e-commerce Indonesia yang disiapkan tim pengembang situs dan <strong>belum ditinjau</strong> oleh Manis Grafika maupun penasihat hukum. Isinya dapat berubah. Terakhir diperbarui: ${UPDATED}.`),
};
const contactLine = p(`Pertanyaan tentang kebijakan ini dapat dikirim melalui WhatsApp <a href="${WA}">${WA_LABEL}</a> atau email <a href="mailto:${EMAIL}">${EMAIL}</a>.`);

const page = (slug, title, heroTitle, blocks) => ({ slug, documentTitle: `${title} – Manis Grafika`, title, heroTitle, accent: ACCENT, blocks });

// ---- Tentang Kami ---------------------------------------------------------------------------------------------------
const icon = (file, alt) => ({ src: `${MG}/${file}`, alt, width: 911, height: 911 });
const aboutUs = page("about-us", "Tentang Kami", ["Tentang", "Kami"], [
  rich(p("<strong>Memberikan Pelayanan Terbaik</strong>", "Kami hadir untuk menemani perjalanan spiritual Anda dengan menghadirkan buku Yasin berkualitas tinggi. Dengan pelayanan terbaik, kami berkomitmen untuk memberikan pengalaman berbelanja yang memuaskan. Setiap buku Yasin yang kami produksi adalah hasil dari dedikasi kami dalam menyajikan karya yang indah dan inspiratif."), "lead"),
  { type: "image", image: img("ABOUT-US-COVER-1.webp", "Galeri produk Manis Grafika", 720, 721), maxWidth: 720 },
  heading("Cerita Kami"),
  rich(p(
    "Setiap momen istimewa layak untuk dirayakan dengan keindahan yang abadi. <strong>Manis Grafika</strong> berkomitmen untuk mengabadikan momen-momen spesial dalam setiap karya, menjadikannya kenangan yang tak terlupakan dalam perjalanan hidup pelanggannya.",
    "<strong>Manis Grafika</strong> adalah percetakan buku Yasin dan tahlil profesional yang berpusat di kota Solo. Kami juga hadir untuk memberikan solusi terbaik bagi konsumen melalui karya yang dibuat dengan hati. Kepuasan konsumen menjadi prioritas kami, sehingga kami akan selalu berusaha menjaga dan meningkatkan value produk dan pelayanan.",
  )),
  { type: "imageGrid", items: [img("TENTANG-KAMIArtboard-4_CONVERT-1024x977.webp", "Proses pengerjaan buku Yasin Manis Grafika", 1024, 977), img("TENTANG-KAMIArtboard-5_CONVERT-1024x977.webp", "Buku Yasin Manis Grafika siap dikemas", 1024, 977)] },
  heading("Mengapa Manis Grafika"),
  {
    type: "iconList",
    variant: "features",
    items: [
      { icon: icon("Desain-Mewah-dan-Elegan_.png", ""), title: "Desain Mewah dan Elegan", html: p("Manis Grafika memadukan desain elegan dan mewah yang memberikan kesan tak terlupakan.") },
      { icon: icon("Material-Premium.png", ""), title: "Material Premium", html: p("Buku-buku Manis Grafika diciptakan dari material premium yang memberikan sentuhan menawan pada setiap halaman.") },
      { icon: { ...icon("Layanan-Ramah-dan-Profesional.png", ""), width: 912 }, title: "Layanan Ramah dan Profesional", html: p("Manis Grafika memberikan pelayanan ramah dan responsif dengan staf profesional untuk menciptakan pengalaman belanja yang memuaskan.") },
      { icon: { ...icon("Pengiriman-ke-Seluruh-Indonesia_.png", ""), width: 912 }, title: "Pengiriman Seluruh Indonesia", html: p("Manis Grafika dapat menjangkau seluruh pelosok negeri dengan memberikan fasilitas pengiriman ke seluruh Indonesia dengan cepat dan aman.") },
    ],
  },
  rich(p(
    "<em>Waktu yang berlalu di setiap momen kehidupan adalah sebuah memori indah yang tidak dapat diulang. Produk kami adalah buah karya seni yang dirancang dengan indah dan penuh makna. Tak hanya menghadirkan keindahan, namun juga kualitas dari setiap produk yang kami buat.</em>",
    "<strong>Manis Grafika, Manis Dilihat.</strong>",
  ), "lead"),
  { type: "button", label: "Lihat Produk", href: "/collections/new-in" },
]);

// ---- Syarat & Ketentuan (draft) -------------------------------------------------------------------------------------
const terms = page("terms-of-service", "Syarat & Ketentuan", ["Syarat &", "Ketentuan"], [
  draftNotice,
  heading("1. Ketentuan Umum"),
  rich(p("Situs ini dikelola oleh Manis Grafika, Surakarta, Jawa Tengah. Dengan mengakses situs ini atau melakukan pemesanan, Anda menyetujui Syarat & Ketentuan ini, Kebijakan Privasi, Kebijakan Pengiriman, dan Kebijakan Pengembalian.")),
  heading("2. Produk dan Personalisasi"),
  list([
    "Produk dibuat sesuai pesanan (made to order) dan dapat dipersonalisasi.",
    "Minimal pemesanan berlaku per produk dan tercantum di halaman produk (umumnya 50 pcs).",
    "Setiap pesanan mendapat 5 halaman redaksi gratis (1 halaman foto dan 4 halaman teks). Penambahan halaman redaksi dikenakan biaya Rp 3.000 per dua halaman.",
    "Anda bertanggung jawab atas kebenaran data personalisasi yang dikirim, termasuk nama, tanggal, foto, dan teks.",
    "Manis Grafika mengirimkan desain untuk Anda periksa. Produksi dimulai setelah desain Anda setujui; kesalahan pada data yang sudah disetujui menjadi tanggung jawab pemesan.",
    "Warna produk pada layar dapat sedikit berbeda dari warna aslinya.",
  ]),
  heading("3. Harga dan Pembayaran"),
  rich(p("Harga ditampilkan dalam Rupiah dan belum termasuk ongkos kirim serta biaya halaman redaksi tambahan. Pembayaran dilakukan melalui QRIS. Pesanan diproses setelah pembayaran terkonfirmasi.")),
  heading("4. Produksi dan Pengiriman"),
  rich(p("Proses pengerjaan membutuhkan waktu sekitar 6–8 hari kerja setelah desain disetujui. Pesanan dikirim dari workshop kami di Surakarta. Rincian pengiriman tercantum di <a href=\"/pages/kebijakan-pengiriman\">Kebijakan Pengiriman</a>.")),
  heading("5. Perubahan dan Pembatalan Pesanan"),
  rich(p("Perubahan data atau pembatalan pesanan dapat diajukan melalui admin sebelum desain disetujui. Karena produk dibuat khusus, pesanan yang sudah masuk tahap produksi tidak dapat dibatalkan.")),
  heading("6. Pengembalian"),
  rich(p("Ketentuan pengembalian dan penggantian produk tercantum di <a href=\"/pages/returns\">Kebijakan Pengembalian</a>.")),
  heading("7. Hak Kekayaan Intelektual"),
  rich(p("Desain, foto, logo, dan konten di situs ini milik Manis Grafika dan tidak boleh digunakan tanpa izin tertulis. Dengan mengirim foto atau teks untuk personalisasi, Anda menyatakan berhak menggunakan materi tersebut.")),
  heading("8. Batasan Tanggung Jawab"),
  rich(p("Manis Grafika tidak bertanggung jawab atas keterlambatan atau kerugian yang disebabkan oleh pihak ketiga, termasuk jasa pengiriman, atau keadaan di luar kendali kami.")),
  heading("9. Perubahan Ketentuan"),
  rich(p("Manis Grafika dapat mengubah Syarat & Ketentuan ini sewaktu-waktu. Versi terbaru selalu tersedia di halaman ini.")),
  heading("10. Hukum yang Berlaku"),
  rich(p("Syarat & Ketentuan ini tunduk pada hukum Republik Indonesia.")),
  heading("11. Kontak"),
  rich(contactLine),
]);

// ---- Kebijakan Privasi (draft, UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi) --------------------------------
const privacy = page("privacy-policy", "Kebijakan Privasi", ["Kebijakan", "Privasi"], [
  draftNotice,
  rich(p("Manis Grafika menghormati privasi Anda dan memproses data pribadi sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.")),
  heading("Data yang Kami Kumpulkan"),
  list([
    "Data kontak: nama, nomor telepon atau WhatsApp, dan alamat email.",
    "Data pengiriman: alamat lengkap penerima.",
    "Data personalisasi pesanan: nama, tanggal, foto, dan teks yang Anda minta dicetak, termasuk data tentang anggota keluarga atau almarhum/almarhumah.",
    "Data transaksi: produk yang dipesan, jumlah, dan status pembayaran. Kami tidak menyimpan data rekening atau kartu Anda.",
    "Data teknis: alamat IP, jenis perangkat, dan cookie yang diperlukan agar situs berfungsi.",
  ]),
  heading("Tujuan Penggunaan Data"),
  list([
    "Memproses, memproduksi, dan mengirim pesanan Anda.",
    "Mengirim desain untuk persetujuan dan menghubungi Anda terkait pesanan.",
    "Memberikan layanan pelanggan.",
    "Mengirim informasi promo, hanya jika Anda mendaftar newsletter.",
    "Memenuhi kewajiban hukum.",
  ]),
  heading("Berbagi Data dengan Pihak Ketiga"),
  rich(p("Kami tidak menjual data pribadi Anda. Data hanya dibagikan sebatas yang diperlukan kepada jasa pengiriman, penyedia layanan pembayaran, dan penyedia hosting yang mendukung operasional situs, atau jika diwajibkan oleh hukum.")),
  heading("Penyimpanan dan Keamanan"),
  rich(p("Data disimpan selama diperlukan untuk tujuan di atas atau sesuai kewajiban hukum. Foto dan data personalisasi disimpan selama diperlukan untuk produksi dan cetak ulang, lalu dapat dihapus atas permintaan Anda. Kami menerapkan langkah keamanan yang wajar untuk melindungi data.")),
  heading("Hak Anda"),
  rich(p("Anda berhak mengakses, memperbaiki, dan meminta penghapusan data pribadi Anda, menarik persetujuan, serta mengajukan keberatan atas pemrosesan data. Ajukan permintaan melalui kontak di bawah.")),
  heading("Cookie"),
  rich(p("Situs ini menggunakan penyimpanan browser dan cookie untuk menyimpan isi keranjang dan pengaturan dasar. Anda dapat menghapusnya melalui pengaturan browser.")),
  heading("Perubahan Kebijakan"),
  rich(p("Kebijakan ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu tersedia di halaman ini.")),
  heading("Kontak"),
  rich(contactLine),
]);

// ---- Kebijakan Pengembalian (draft) ---------------------------------------------------------------------------------
const returns = page("returns", "Kebijakan Pengembalian", ["Kebijakan", "Pengembalian"], [
  draftNotice,
  rich(p("Setiap produk Manis Grafika dibuat khusus sesuai pesanan dan data personalisasi Anda. Karena itu, kami tidak menerima pengembalian karena berubah pikiran. Kami akan mengganti atau mencetak ulang produk jika terjadi kesalahan dari pihak kami.")),
  heading("Kondisi yang Dapat Diajukan"),
  list([
    "Cacat produksi, misalnya jilid lepas, halaman rusak, atau cetakan tidak terbaca.",
    "Hasil cetak tidak sesuai dengan desain yang sudah Anda setujui.",
    "Produk rusak saat diterima.",
    "Jumlah produk yang diterima kurang dari pesanan.",
  ]),
  heading("Cara Mengajukan"),
  list([
    `Hubungi admin melalui WhatsApp <a href="${WA}">${WA_LABEL}</a> paling lambat 2 × 24 jam setelah paket diterima.`,
    "Sertakan nomor pesanan, foto produk, dan video saat membuka paket (unboxing) tanpa jeda.",
    "Tim kami akan memeriksa laporan dan menginformasikan solusi: cetak ulang, penggantian produk, atau pengembalian dana untuk produk yang terdampak.",
  ], true),
  heading("Pengecualian"),
  list([
    "Kesalahan data personalisasi yang sudah Anda setujui pada tahap desain.",
    "Perbedaan warna ringan akibat tampilan layar.",
    "Kerusakan karena pemakaian atau penyimpanan yang tidak sesuai.",
  ]),
  rich(contactLine),
]);

// ---- Kebijakan Pengiriman (draft) -----------------------------------------------------------------------------------
const shipping = page("kebijakan-pengiriman", "Kebijakan Pengiriman", ["Kebijakan", "Pengiriman"], [
  draftNotice,
  heading("Lokasi Pengiriman"),
  rich(p("Semua pesanan diproses dan dikirim dari workshop kami di Surakarta, Jawa Tengah, ke seluruh Indonesia.")),
  heading("Waktu Proses"),
  rich(p("Proses pengerjaan dilakukan setelah desain disetujui oleh pelanggan dan membutuhkan waktu sekitar 6–8 hari kerja. Untuk permintaan percepatan, silakan hubungi admin Manis Grafika.")),
  heading("Ongkos Kirim"),
  rich(p("Harga produk belum termasuk ongkos kirim. Ongkos kirim dihitung saat checkout berdasarkan alamat tujuan, berat pesanan, dan jasa pengiriman yang Anda pilih.")),
  heading("Pelacakan"),
  rich(p("Setelah pesanan dikirim, nomor resi dikirim melalui WhatsApp atau email. Estimasi waktu tiba mengikuti layanan jasa pengiriman.")),
  heading("Alamat Pengiriman"),
  rich(p("Pastikan alamat dan nomor telepon penerima benar. Biaya pengiriman ulang akibat alamat yang tidak lengkap atau salah menjadi tanggung jawab pemesan.")),
  rich(contactLine),
]);

// Policy pages use the compact "policy" layout (readable column, smaller titles, draft notice aligned to the text).
for (const policy of [terms, privacy, returns, shipping]) policy.variant = "policy";
for (const content of [aboutUs, terms, privacy, returns, shipping]) write(`src/data/pages/content/${content.slug}.json`, content);

// ---- FAQ ------------------------------------------------------------------------------------------------------------
const faqBase = readJson("reference/pre-rebrand-data/pages/faqs.json");
const faqId = (label) => label.replace(/[,&\s-]+/g, "_");
const FAQ = [
  // Verbatim from the manisgrafika.id homepage FAQ (reference/manisgrafika/2026-11-16/home-faq-answers.json);
  // "silahkan hubungan" corrected to "silakan hubungi".
  ["Paling Sering", [
    ["Apakah harga yang tercantum sudah termasuk semua biaya?", p("Harga yang tertera sudah nett, namun belum termasuk ongkos kirim dan penambahan halaman redaksi (apabila ada).")],
    ["Dari mana pesanan saya akan dikirim?", p("Semua pesanan akan diproses dan dikirimkan dari workshop kami yang berlokasi di Surakarta, Jawa Tengah.")],
    ["Berapa lama pesanan saya siap?", p("Proses pengerjaan dilakukan setelah desain disetujui oleh pelanggan dan membutuhkan waktu sekitar 6–8 hari kerja.")],
    ["Apakah pesanan saya bisa lebih cepat dari 6–8 hari kerja?", p(`Untuk permintaan percepatan proses barang jadi, silakan hubungi admin Manis Grafika melalui WhatsApp <a href="${WA}">${WA_LABEL}</a>.`)],
    ["Apakah saya bisa menambah halaman redaksi (lebih dari 5 halaman)?", p("Bisa, dengan biaya tambahan sebesar Rp 3.000 per dua halaman redaksi.")],
  ]],
  // Written from facts in the Manis Grafika product descriptions and owner decisions; client review pending.
  ["Pemesanan", [
    ["Berapa minimal pemesanan?", p("Minimal pemesanan umumnya 50 pcs per produk. Jumlah minimal setiap produk tercantum di halaman produk.")],
    ["Apa itu halaman redaksi?", p("Halaman redaksi adalah halaman personal di dalam buku, misalnya foto dan data almarhum/almarhumah atau kata pengantar dari keluarga. Setiap pesanan mendapat 5 halaman redaksi gratis: 1 halaman foto dan 4 halaman teks.")],
    ["Bagaimana proses desainnya?", p("Setelah pesanan dan data personalisasi kami terima, tim kami menyiapkan desain untuk Anda periksa. Produksi dimulai setelah desain Anda setujui.")],
    ["Saya ingin bertanya sebelum memesan. Ke mana saya menghubungi?", p(`Hubungi admin kami melalui WhatsApp <a href="${WA}">${WA_LABEL}</a> atau email <a href="mailto:${EMAIL}">${EMAIL}</a>.`)],
  ]],
  ["Pengiriman", [
    ["Berapa ongkos kirimnya?", p("Ongkos kirim dihitung saat checkout berdasarkan alamat tujuan dan berat pesanan.")],
    ["Apakah pesanan bisa dikirim ke seluruh Indonesia?", p("Bisa. Kami mengirim pesanan dari Surakarta ke seluruh Indonesia.")],
    ["Bagaimana saya melacak pesanan?", p("Setelah pesanan dikirim, kami mengirimkan nomor resi melalui WhatsApp atau email.")],
  ]],
  ["Pembayaran", [
    ["Metode pembayaran apa yang tersedia?", p("Pembayaran dilakukan melalui QRIS. Anda dapat memindai kode QRIS dengan aplikasi mobile banking atau dompet digital.")],
    ["Kapan pesanan saya diproses?", p("Pesanan diproses setelah pembayaran terkonfirmasi dan desain disetujui.")],
  ]],
  ["Pengembalian", [
    ["Apakah produk bisa dikembalikan?", p("Karena setiap produk dibuat khusus sesuai pesanan, kami tidak menerima pengembalian karena berubah pikiran. Kami mengganti atau mencetak ulang produk jika terjadi kesalahan dari pihak kami. Baca <a href=\"/pages/returns\">Kebijakan Pengembalian</a>.")],
    ["Bagaimana jika produk saya rusak saat diterima?", p(`Hubungi admin melalui WhatsApp <a href="${WA}">${WA_LABEL}</a> paling lambat 2 × 24 jam setelah paket diterima, dengan foto produk dan video saat membuka paket.`)],
  ]],
];
const rowTpl = faqBase.groups[0].rows[0];
const faqs = {
  ...faqBase,
  documentTitle: "FAQ – Manis Grafika",
  header: {
    ...faqBase.header,
    image: `${MG}/pages/faq-header.webp`,
    imageAlt: "FAQ Manis Grafika",
    buttons: FAQ.map(([label], i) => ({ label, text: label, active: i === 0 })),
  },
  groups: FAQ.map(([label, rows], gi) => {
    const base = faqBase.groups[gi] ?? faqBase.groups[0];
    const sectionId = gi < faqBase.groups.length ? base.sectionId : `${base.sectionId}_${gi}`;
    return {
      ...base,
      sectionId,
      id: faqId(label),
      heading: label,
      rows: rows.map(([question, answerHtml], ri) => {
        const key = `mg_${gi + 1}_${ri + 1}`;
        return { ...rowTpl, detailsId: `Details-${key}-${sectionId}`, question, contentId: `Accordion-${key}-${sectionId}`, answerHtml };
      }),
    };
  }),
};
write("src/data/pages/faqs.json", faqs);

// ---- Hubungi Kami ---------------------------------------------------------------------------------------------------
const contactBase = readJson("reference/pre-rebrand-data/pages/contact-us.json");
const banner = `${MG}/pages/hubungi-kami-header.webp`;
const contact = {
  ...contactBase,
  documentTitle: "Hubungi Kami – Manis Grafika",
  richText: {
    ...contactBase.richText,
    style: contactBase.richText.style.replace(/#5dd972/g, "#2b5865"),
    placeholder: banner,
    srcset: [{ src: banner, w: 1600 }],
    width: 800,
    height: 250,
    alt: "Hubungi Kami",
  },
  multicolumn: {
    ...contactBase.multicolumn,
    columns: [
      { title: "WhatsApp", html: p(`<a href="${WA}" target="_blank" title="WhatsApp Manis Grafika">${WA_LABEL}</a>`) },
      { title: "Email", html: p(`<a href="mailto:${EMAIL}" title="mailto:${EMAIL}">${EMAIL}</a>`) },
      { title: "Workshop", html: p(`${ADDRESS}<br/><a href="${MAPS}" target="_blank" title="Google Maps">Lihat di Google Maps</a>`) },
      { title: "Layanan Pengaduan Konsumen", html: p(`<a href="mailto:${EMAIL}" title="mailto:${EMAIL}">${EMAIL}</a><br/><br/><strong>Direktorat Jenderal Perlindungan Konsumen dan Tertib Niaga<br/>Kementerian Perdagangan Republik Indonesia</strong><br/>0853 1111 1010 (WhatsApp)`) },
    ].map((c, i) => ({ className: contactBase.multicolumn.columns[i].className, ...c })),
  },
};
write("src/data/pages/contact-us.json", contact);

// ---- Wishlist (logged-out empty state) ------------------------------------------------------------------------------
const wishlistBase = readJson("reference/pre-rebrand-data/pages/wishlist.json");
write("src/data/pages/wishlist.json", {
  ...wishlistBase,
  documentTitle: "Wishlist – Manis Grafika",
  title: "Wishlist Saya",
  user: { label: "Pembeli tamu. Tautan ini membuka pop-up.", text: "Pembeli Tamu" },
  tabs: [
    { ...wishlistBase.tabs[0], label: "Tab wishlist", text: "Wishlist" },
    { ...wishlistBase.tabs[1], label: "Tab disimpan untuk nanti", text: "Disimpan untuk Nanti" },
  ],
  detailTitle: "Wishlist Saya",
  shareLabel: "Bagikan. Tautan ini membuka pop-up.",
  menuLabel: "Opsi lainnya",
  empty: {
    title: "Suka? Simpan ke Wishlist",
    text: "Wishlist membantu Anda menyimpan produk favorit di komputer, ponsel, atau tablet, sehingga tidak perlu mencari ulang produk yang Anda sukai.",
    button: "Lanjut belanja",
  },
});

// ---- Blog: BTV articles removed, 3 labelled placeholders until the client supplies articles through the CMS --------
const categories = [
  { handle: "inspirasi", title: "Inspirasi", description: "Ide dan inspirasi buku Yasin, tahlil, dan paket hadiah untuk momen keluarga." },
  { handle: "promo", title: "Promo", description: "Informasi promo dan penawaran Manis Grafika." },
  { handle: "kabar", title: "Kabar Manis Grafika", description: "Cerita dari workshop dan tim Manis Grafika." },
];
const article = (slug, category, title, date, hero) => ({
  slug,
  category,
  title,
  documentTitle: `${title} – Manis Grafika`,
  date,
  dateLabel: date.split("-").reverse().join("."),
  description: "Contoh artikel. Isi lengkap akan diisi oleh Manis Grafika melalui CMS.",
  hero,
  source: null,
  hasBody: false,
  sourceUrl: "",
});
write("src/data/blogs/blogs.json", {
  snapshot: "Manis Grafika placeholders 2026-11-17 (scripts/manisgrafika/build-pages.mjs)",
  categories,
  articles: [
    article("contoh-inspirasi-buku-yasin-keluarga", "inspirasi", "[Contoh] Inspirasi Buku Yasin untuk Peringatan Keluarga", "2026-11-17", img("DSC01990_CONVERT-scaled.webp", "Buku Yasin Manis Grafika", 1707, 2560)),
    article("contoh-promo-manis-grafika", "promo", "[Contoh] Promo Manis Grafika", "2026-11-16", img("DSC06248_CONVERT-scaled.webp", "Dompet dan buku Yasin Manis Grafika", 1707, 2560)),
    article("contoh-kabar-workshop-surakarta", "kabar", "[Contoh] Kabar dari Workshop Surakarta", "2026-11-15", img("ABOUT-US-COVER-1.webp", "Galeri produk Manis Grafika", 720, 721)),
  ],
});
write("src/data/blogs/bodies.json", {
  placeholder: [
    rich(p("Ini adalah artikel contoh. Judul, gambar, dan isi artikel akan diganti oleh Manis Grafika melalui CMS."), "lead"),
    heading("Subjudul artikel"),
    rich(p(
      "Paragraf pembuka artikel. Bagian ini akan berisi cerita, inspirasi, atau informasi promo dari Manis Grafika, misalnya tentang memilih buku Yasin untuk peringatan keluarga atau paket hadiah untuk acara tahlilan.",
      "Paragraf kedua melanjutkan pembahasan dengan contoh produk, tips, atau detail acara yang relevan bagi pembaca.",
    )),
    list(["Poin penting pertama.", "Poin penting kedua.", "Poin penting ketiga."]),
    rich(p(`Ada pertanyaan? Hubungi kami melalui WhatsApp <a href="${WA}">${WA_LABEL}</a>.`)),
  ],
});
console.log("pages: 5 content, faqs, contact-us, wishlist; blog: 3 placeholder articles");
