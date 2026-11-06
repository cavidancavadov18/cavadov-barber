"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { parseSectionHash } from "@/lib/section-ids";
import { useSiteContent } from "@/components/layout/SiteContentContext";

const primaryLinks = [
  { href: "#services", key: "services" },
  { href: "#barbers", key: "barbers" },
  { href: "#gallery", key: "gallery" },
  { href: "#booking", key: "booking" },
  { href: "#contact", key: "contact" },
] as const;

const allLinks = [
  { href: "#services", key: "services" },
  { href: "#barbers", key: "barbers" },
  { href: "#polad-works", key: "works" },
  { href: "#gallery", key: "gallery" },
  { href: "#tiktok", key: "tiktok" },
  { href: "#before-after", key: "beforeAfter" },
  { href: "#booking", key: "booking" },
  { href: "#about", key: "about" },
  { href: "#reviews", key: "reviews" },
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
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    setOpen(false);
  }, [pathname, activeHash]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const otherLocale = locale === "az" ? "en" : "az";
  const sectionOpen = Boolean(parseSectionHash(activeHash));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-400 ${
        scrolled || sectionOpen || open
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
            setOpen(false);
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
          <a href="#booking" className="btn-primary hidden !px-3 !py-2 sm:inline-flex lg:!px-4">
            <span>{t("bookNow")}</span>
          </a>
          <button
            type="button"
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-[var(--line)] lg:hidden"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`h-px w-5 bg-[var(--gold-soft)] transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-5 bg-[var(--gold-soft)] transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 top-[3.6rem] z-40 overflow-y-auto bg-[rgba(8,8,8,0.985)] px-5 pb-32 pt-8 lg:hidden"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--gold)]">{t("menu")}</p>
            <div className="mt-7 flex flex-col gap-1">
              {allLinks.map((link, i) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between border-b border-[var(--line)] py-5 ${
                    activeHash === link.href ? "text-[var(--gold-soft)]" : "text-[var(--text)]"
                  }`}
                >
                  <span className="font-display text-[1.4rem] tracking-[0.1em]">{t(link.key)}</span>
                  <span className="text-[0.65rem] tracking-[0.16em] text-[var(--text-muted)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </div>
            <a
              href="#booking"
              className="btn-primary mt-10 w-full"
              onClick={() => setOpen(false)}
            >
              <span>{t("bookNow")}</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
