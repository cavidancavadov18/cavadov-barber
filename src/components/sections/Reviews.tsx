"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";
import { useSiteContent } from "@/components/layout/SiteContentContext";

export function Reviews() {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const { reviews } = useSiteContent();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reviews.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [paused, reviews.length]);

  const review = reviews[index];
  if (!review) return null;
  const name = locale === "en" ? review.nameEn : review.nameAz;
  const text = locale === "en" ? review.textEn : review.textAz;

  return (
    <section id="reviews" className="section-y overflow-hidden bg-[var(--bg-elevated)]">
      <div className="section-pad container-site">
        <SectionReveal>
          <p className="eyebrow">{t("eyebrow")}</p>
          <StaggerText text={t("title")} className="heading-lg mt-4" />
        </SectionReveal>

        <SectionReveal delay={0.08} className="mt-12">
          <div
            className="relative mx-auto max-w-3xl border border-[var(--line)] bg-[var(--surface)] px-6 py-10 md:px-12 md:py-14"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-70" />

            <AnimatePresence mode="wait">
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="flex justify-center gap-1 text-[var(--gold)]" aria-hidden>
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * idx }}
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <p className="mt-7 font-display text-[clamp(1.2rem,2.6vw,1.75rem)] leading-relaxed tracking-[0.02em] text-[var(--text)]">
                  “{text}”
                </p>
                <p className="mt-8 text-xs uppercase tracking-[0.24em] text-[var(--gold-soft)]">
                  {name}
                </p>
              </motion.article>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Previous review"
                className="border border-[var(--line)] px-3 py-2 text-sm text-[var(--gold-soft)] transition hover:border-[var(--gold)]"
                onClick={() => setIndex((i) => (i - 1 + reviews.length) % reviews.length)}
                data-cursor="hover"
              >
                ←
              </button>
              <div className="flex gap-2">
                {reviews.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Review ${i + 1}`}
                    onClick={() => setIndex(i)}
                    data-cursor="hover"
                    className={`h-1.5 transition-all ${
                      i === index
                        ? "w-8 bg-[var(--gold)]"
                        : "w-1.5 bg-[var(--surface-2)] hover:bg-[var(--gold-dim)]"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next review"
                className="border border-[var(--line)] px-3 py-2 text-sm text-[var(--gold-soft)] transition hover:border-[var(--gold)]"
                onClick={() => setIndex((i) => (i + 1) % reviews.length)}
                data-cursor="hover"
              >
                →
              </button>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
