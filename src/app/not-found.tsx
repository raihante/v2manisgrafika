import Link from "next/link";
import { SiteChrome } from "@/components/shell/SiteChrome";

export const metadata = { title: "404 Halaman Tidak Ditemukan – Manis Grafika" };

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="cm-page cm-not-found">
        <h1>Halaman tidak ditemukan</h1>
        <p>Halaman yang Anda cari tidak ada atau sudah dipindahkan.</p>
        <Link className="cm-button" href="/">Lanjut Belanja</Link>
      </section>
    </SiteChrome>
  );
}
