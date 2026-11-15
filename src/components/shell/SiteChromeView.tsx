"use client";
/* eslint-disable @next/next/no-img-element */
// Client part of the shared storefront shell (SiteChrome): footer, newsletter, back-to-top and the #wrapper hierarchy.
// Content comes from the StorefrontProvider that src/components/shell/SiteChrome.tsx fills on the server.
import { FormEvent, Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BackstagePassPopup, OPEN_CART_EVENT } from "@/components/Overlays";
import { AnnouncementBar, SiteHeader } from "@/components/shell/SiteHeader";
import { PageLoading, ShellPanels } from "@/components/shell/ShellPanels";
import { useChrome } from "@/components/shell/StorefrontContext";

function Footer() {
  const { footerLinks, payments } = useChrome();
  const groups = [
    { title: "About BTV", links: footerLinks.slice(0, 3) },
    { title: "BTV Rewards", links: footerLinks.slice(3, 7) },
    { title: "Explore", links: footerLinks.slice(7, 12) },
    { title: "Support", links: footerLinks.slice(12, 17) },
  ];
  const socialLinks = footerLinks.slice(17);
  // Source wraps each social PNG in an SVG <image>; Pinterest carries its own offset transform.
  const socialTransform = (name: string) => (name === "pinterest" ? "translate(-2.44 -4.23) scale(.3)" : "scale(.29)");
  const paymentIcons = (
    <div className="footer-payment-icons">{payments.map((payment) => <Fragment key={payment.name}>{" "}<figure><img className="payment-icon-img" src={payment.image} alt={payment.name} width="100%" height="100%" /></figure></Fragment>)}{" "}</div>
  );
  return (
    <footer className="footer">
      <div className="footer-column-wrap-left">
        <div className="row full-width-row jsc-container-padding">
          {groups.map((group) => (
            <div className="small-12 medium-3 columns widget--menu-column" key={group.title}>
              <div className="widget widget--menu">
                <div className="thb-widget-title collapsible"><div className="jsc-widget-title">{group.title}</div></div>
                <ul className="thb-widget-menu">{group.links.map((link) => <li key={link.text}><Link href={link.href}>{link.text}</Link></li>)}</ul>
              </div>
            </div>
          ))}
        </div>
        <div className="sub-footer">
          <div className="row full-width-row small-down--p-r-15 small-down--p-l-15">
            <div className="sub-footer-left">
              <div className="social-footer small-12 columns">
                <ul className="social-links">{socialLinks.map((link) => {
                  const name = link.text.toLowerCase();
                  return <li key={link.text}><a className={`social ${name}`} href={link.href} target="_blank" rel="noreferrer"><svg width="16" className={`icon icon-${name}`} viewBox="0 0 150 150" aria-hidden="true"><image width="512" height="512" transform={socialTransform(name)} href={`/assets/social-icons/${name}.png`} /></svg><span>{link.text}</span></a></li>;
                })}</ul>
              </div>
              <div className="small-12 columns"><p className="copyright-label">© Beyond The Vines Indonesia</p></div>
            </div>
            <div className="sub-footer copyright-desc">
              <div><p className="payment-icons-title">Beyond The Vines accepts</p></div>
              {paymentIcons}
            </div>
            <div className="copyright-desc-mobile">
              <div><p className="payment-icons-title">Beyond The Vines accepts</p></div>
              {paymentIcons}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// MOCK: the form never submits; it only shows the success message (docs/mock-behaviors.md "Newsletter").
export function NewsletterSection() {
  const { newsletter } = useChrome();
  const [subscribed, setSubscribed] = useState(false);
  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };
  return (
    <section className="newsletter">
      <div className="email-signup-inner">
        <div className="email-signup-column">
          <div className="section-header">
            <div className="section-header--content">
              <h2 className="h3">{newsletter.title}</h2>
              <div className="rte"><p>{newsletter.tagline}</p></div>
            </div>
          </div>
        </div>
        <div className="email-signup-column email-signup-column-2">
          <div className="email-signup-description show-desktop">
            <p>{newsletter.descriptionDesktop[0]}</p>
            <p>{newsletter.descriptionDesktop[1]}</p>
          </div>
          <div className="email-signup-description show-mobile">
            <p>{newsletter.descriptionMobile[0]}</p>
            <p>{newsletter.descriptionMobile[1]}</p>
          </div>
          <div className="signup-container">
            <form className="signup-form" onSubmit={subscribe}>
              <fieldset>
                <div className="field">
                  <input required type="email" id="NewsletterForm-email" name="contact[email]" placeholder={newsletter.placeholder} autoComplete="email" />
                  <label className="field__label" htmlFor="NewsletterForm-email">{newsletter.placeholder}</label>
                </div>
                <button className="submit" type="submit" aria-label="Enter your email">
                  {newsletter.buttonText}
                  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
                    <path d="M0.799805 5.5H12.7998" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.49976 1L13.9998 5.5L9.49976 10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </fieldset>
              {subscribed && <div className="jsc-newsletter-message-section">{newsletter.successMessage}</div>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// Source <back-to-top>: fixed pill that slides in once the page is scrolled past one viewport height.
function BackToTop() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const update = () => setActive(window.scrollY > window.innerHeight);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return (
    <button type="button" className={`back-to-top${active ? " back-to-top--active" : ""}`} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <svg width="11" height="16" viewBox="0 0 11 16" fill="none" aria-hidden="true">
        <path className="back-to-top--bar" d="M4.87654 2.34497C4.87654 1.99178 5.16285 1.70547 5.51604 1.70547C5.86922 1.70547 6.15554 1.99179 6.15554 2.34497V15.5613C6.15554 15.9144 5.86922 16.2008 5.51604 16.2008C5.16285 16.2008 4.87654 15.9144 4.87654 15.5613V2.34497Z" fill="#151515" />
        <path className="back-to-top--handle" d="M0.197525 5.0502L5.02195 0.225769C5.14739 0.100345 5.32293 0.0251028 5.48588 0C5.66143 -7.67342e-09 5.83696 0.0752197 5.96239 0.200647L10.7994 5.03761C10.9373 5.17554 11 5.33858 11 5.51412C11 5.68967 10.9248 5.8652 10.7994 5.99063C10.5486 6.254 10.1223 6.254 9.85892 5.99063L6.16301 2.30726C5.72921 2.1318 5.72921 1.70547 4.83387 2.29472L1.13796 5.99063C0.887198 6.254 0.460891 6.254 0.197525 5.99063C-0.0658415 5.73987 -0.0658415 5.31356 0.197525 5.0502Z" fill="#151515" />
      </svg>
    </button>
  );
}

// Shared storefront shell on the source container hierarchy: #wrapper > announcement + header sections,
// div#main-content (role=main), footer group, then the side panels and .click-capture (reference/dom/r256-header/).
// <back-to-top> is a body-level sibling of #wrapper on the source.
export function SiteChromeView({ children, backToTop = false }: { children: React.ReactNode; backToTop?: boolean }) {
  const { layout } = useChrome();
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    const openCart = () => setCartOpen(true);
    window.addEventListener(OPEN_CART_EVENT, openCart);
    return () => window.removeEventListener(OPEN_CART_EVENT, openCart);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  return (
    <>
      <div id="wrapper">
        <AnnouncementBar />
        <SiteHeader onOpenCart={() => setCartOpen(true)} />
        <div role="main" id="main-content">
          {layout.hiddenInputs.map((input) => <input key={input.id} type="hidden" id={input.id} value={input.value} />)}
          {children}
        </div>
        <Footer />
        <ShellPanels cartOpen={cartOpen} closeCart={closeCart} />
      </div>
      {backToTop && <BackToTop />}
      <PageLoading />
      <BackstagePassPopup />
    </>
  );
}
