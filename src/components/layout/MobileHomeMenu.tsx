"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

const items = [
  { href: "#services", key: "services", hintAz: "Qiymət siyahısı", hintEn: "Price list" },
  { href: "#barbers", key: "barbers", hintAz: "Polad usta", hintEn: "Master Polad" },
  { href: "#polad-works", key: "works", hintAz: "Son işlər", hintEn: "Latest work" },
  { href: "#gallery", key: "gallery", hintAz: "Kəsimlər", hintEn: "Cuts" },
  { href: "#tiktok", key: "tiktok", hintAz: "Videolar", hintEn: "Videos" },
  { href: "#before-after", key: "beforeAfter", hintAz: "Dəyişim", hintEn: "Transform" },
  { href: "#booking", key: "booking", hintAz: "Online növbə", hintEn: "Book online" },
  { href: "#about", key: "about", hintAz: "Haqqımızda", hintEn: "Our story" },
  { href: "#reviews", key: "reviews", hintAz: "Müştəri sözü", hintEn: "Client words" },
  { href: "#contact", key: "contact", hintAz: "Ünvan / telefon", hintEn: "Address / phone" },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

export function MobileHomeMenu() {
  const t = useTranslations("nav");
  const tHome = useTranslations("homeMenu");
  const locale = useLocale();
  const reduce = useReducedMotion();

  return (
    <section
      id="menu"
      className="section-pad relative border-t border-[var(--line)] bg-[var(--bg)] pb-36 pt-16 md:pb-20 md:pt-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_280px_at_50%_0%,rgba(201,168,76,0.08),transparent_65%)]" />
      <div className="relative mx-auto max-w-[720px]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="eyebrow">{tHome("eyebrow")}</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,8vw,2.7rem)] tracking-[0.08em] text-[var(--gold-soft)] md:mt-4">
            {tHome("title")}
          </h2>
          <p className="mt-3.5 max-w-md text-[0.98rem] leading-[1.65] text-[var(--text-muted)] md:mt-4 md:text-base">
            {tHome("subtitle")}
          </p>
        </motion.div>

        <div className="mt-11 flex flex-col gap-3.5 md:mt-12 md:gap-5">
          {items.map((item, i) => (
            <motion.a
              key={item.key}
              href={item.href}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.28), ease }}
              whileTap={reduce ? undefined : { scale: 0.985 }}
              className={`menu-card flex items-center justify-between gap-4 border border-[var(--line)] bg-[var(--surface)] px-5 py-5.5 md:px-6 md:py-6 ${
                item.key === "booking" ? "border-[var(--gold)]/45 bg-[rgba(201,168,76,0.09)]" : ""
              }`}
              style={{ paddingBlock: "1.35rem" }}
            >
              <div className="min-w-0">
                <span className="text-[0.6rem] uppercase tracking-[0.24em] text-[var(--gold)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 block font-display text-[1.4rem] tracking-[0.07em] text-[var(--gold-soft)] md:text-2xl">
                  {t(item.key)}
                </span>
                <span className="mt-1.5 block text-[0.9rem] leading-snug text-[var(--text-muted)]">
                  {locale === "en" ? item.hintEn : item.hintAz}
                </span>
              </div>
              <span
                className="menu-card__arrow flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--line)] text-base text-[var(--gold)]"
                aria-hidden
              >
                →
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
