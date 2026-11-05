import Link from "next/link";
import { SiteChrome } from "@/components/HomePage";

export const metadata = { title: "404 Not Found – Beyond The Vines Indonesia" };

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="cm-page cm-not-found">
        <h1>Page not found</h1>
        <p>The page you were looking for does not exist.</p>
        <p className="cm-note">Preview: this page is not part of the checkout preview yet.</p>
        <Link className="cm-button" href="/">Continue shopping</Link>
      </section>
    </SiteChrome>
  );
}
