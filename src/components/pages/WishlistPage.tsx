"use client";
// /pages/wishlist in the markup the Swym app renders for a logged-out shopper with an empty wishlist (live DOM,
// 2026-11-06; template page.swym wraps it in .blog-post-detail > .page-content-width.rte).
// MOCK (docs/mock-behaviors.md "Wishlist page"): tabs only switch their selected state (the source "Saved for Later"
// content was not observed); "Guest Shopper" (Swym login pop-up) and the disabled share button do nothing;
// "Continue shopping" goes to the homepage (ASSUMPTION: the Swym target was not observed).
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WishlistPageData } from "@/lib/pages/wishlist";

export default function WishlistPage({ page }: { page: WishlistPageData }) {
  const router = useRouter();
  const [tab, setTab] = useState(Math.max(0, page.tabs.findIndex((t) => t.selected)));
  return (
    <div className="row">
      <div className="small-12 columns">
        <div className="blog-post-detail">
          <div className="page-content-width rte">
            <div id="swym-wishlist-render-container">
              <div className={page.pageClass}>
                <div className="swym-simple-wishlist-container">
                  <div className={page.titleBarClass}>
                    <div className="swym-wishlist-main-title swym-heading swym-heading-1" role="heading" aria-level={1}>{page.title}</div>
                    <button id="swym-user-login-status-btn" className="swym-user-login-status swym-icon swym-is-button swym-color-6" aria-label={page.user.label}><span className="swym-user-text swym-value swym-value-1">{page.user.text}</span></button>
                  </div>
                  <ul className="swym-htc-tabs" role="tablist">
                    {page.tabs.map((t, i) => (
                      <li key={t.label} className={`${t.className}${i === tab ? " swym-bg-2 swym-selected" : ""}`} tabIndex={0} role="tab" aria-label={t.label} aria-selected={i === tab} onClick={() => setTab(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setTab(i); }}>{t.text}</li>
                    ))}
                  </ul>
                  <div className="swym-simple-wishlist-container-content">
                    <div className={page.detailClass}>
                      <div className="swym-wishlist-detail-header">
                        <h2 className="swym-wishlist-main-title swym-heading swym-heading-1 swym-is-heading" id="swym-modal-wishlist-title">{page.detailTitle}</h2>
                        <div className="swym-action-container"><button disabled className="swym-share-btn swym-color-2 swym-disabled" title="Share" aria-label={page.shareLabel}><span className="swym-icon"></span></button></div>
                        <div role="button" tabIndex={0} className="swym-wishlist-context-menu swym-icon swym-is-button swym-nav swym-nav-1" id="swym-wishlist-context-menu" aria-label={page.menuLabel} aria-expanded={false}></div>
                      </div>
                      <div className="swym-wishlist-detail-separator"></div>
                      <div className="swym-wishlist-detail-content">
                        <div className="swym-empty-wishlist-container">
                          <h3 className="swym-empty-wishlist-title swym-heading swym-heading-1" aria-level={2}>{page.empty.title}</h3>
                          <p className="swym-empty-wishlist-text swym-text swym-text-1">{page.empty.text}</p>
                          <button className="swym-empty-wishlist-continue-btn swym-button swym-button-1 swym-is-button swym-bg-2 swym-color-4" role="link" aria-label={page.empty.button} onClick={() => router.push("/")}>{page.empty.button}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
