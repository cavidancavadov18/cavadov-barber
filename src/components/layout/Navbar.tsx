"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { parseSectionHash } from "@/lib/section-ids";
import { useSiteContent } from "@/components/layout/SiteContentContext";

const primaryLinks = [
  { href: "#services", key: "services" },
  { href: "#barbers", key: "barbers" },
  { href: "#gallery", key: "gallery" },
  { href: "#booking", key: "booking" },
  { href: "#contact", key: "contact" },
] as const;

function goHome() {
  const { pathname, search } = window.location;
  window.history.pushState("", document.title, `${pathname}${search}`);
  window.dispatchEvent(new Event("hashchange"));
  window.scrollTo({ top: 0 });
}

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { settings } = useSiteContent();
  const BRAND_AVATAR = settings.brandAvatar;
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sync = () => setActiveHash(window.location.hash.split("?")[0]);
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const otherLocale = locale === "az" ? "en" : "az";
  const sectionOpen = Boolean(parseSectionHash(activeHash));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-400 ${
        scrolled || sectionOpen
          ? "border-b border-[var(--line)] bg-[rgba(10,10,10,0.94)] py-3 backdrop-blur-md"
          : "bg-transparent py-4"
      }`}
    >
      <div className="section-pad mx-auto flex max-w-[1400px] items-center justify-between gap-3">
        <Link
          href="/"
          onClick={(e) => {
            if (sectionOpen) {
              e.preventDefault();
              goHome();
            }
          }}
          className="flex min-w-0 items-center gap-2.5 font-display text-base tracking-[0.18em] text-[var(--gold-soft)] sm:gap-3 sm:text-lg md:text-xl"
        >
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[var(--line)] sm:h-9 sm:w-9">
            <Image src={BRAND_AVATAR} alt="CAVADOV BARBER" fill sizes="36px" className="object-cover" />
          </span>
          <span className="truncate">CAVADOV</span>
        </Link>

        <nav className="hidden items-center gap-5 xl:gap-6 lg:flex">
          {primaryLinks.map((link) => {
            const active = activeHash === link.href;
            return (
              <a
                key={link.key}
                href={link.href}
                className={`text-[0.68rem] uppercase tracking-[0.16em] transition-colors ${
                  active
                    ? "text-[var(--gold-soft)]"
                    : "text-[var(--text-muted)] hover:text-[var(--gold-soft)]"
                }`}
              >
                {t(link.key)}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={pathname}
            locale={otherLocale}
            className="border border-[var(--line)] px-2.5 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--gold-soft)] sm:px-3"
          >
            {otherLocale.toUpperCase()}
          </Link>
          <a href="#booking" className="btn-primary !hidden !min-h-0 !px-4 !py-2 lg:!inline-flex">
            <span>{t("bookNow")}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
