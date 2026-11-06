"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";
import { useSiteContent } from "@/components/layout/SiteContentContext";

export function Gallery() {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const { gallery: galleryImages } = useSiteContent();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="gallery" className="section-pad section-y">
      <div className="container-site">
        <SectionReveal>
          <p className="eyebrow">{t("eyebrow")}</p>
          <StaggerText text={t("title")} className="heading-lg mt-4" />
          <p className="mt-5 max-w-xl text-[var(--text-muted)]">{t("subtitle")}</p>
        </SectionReveal>

        <div className="media-grid media-grid--4 mt-14">
          {galleryImages.map((item, i) => (
            <SectionReveal key={item.src} delay={i * 0.03} className="h-full">
              <MediaFrame delay={i * 0.04} className="h-full">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  data-cursor="hover"
                  className="media-card group relative block h-full w-full text-left"
                >
                  <div className="media-frame media-frame--portrait">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      quality={90}
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                      className={`media-img ${item.focus || "object-center"}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-85 transition group-hover:opacity-95" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 md:p-4">
                      <div>
                        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--gold)]">
                          {t("after")}
                        </p>
                        <p className="mt-1 font-display text-sm tracking-[0.08em] text-[var(--gold-soft)] md:text-base">
                          {locale === "en" ? item.labelEn : item.labelAz}
                        </p>
                      </div>
                      <span className="text-[0.65rem] uppercase tracking-[0.18em] text-white/70 opacity-0 transition group-hover:opacity-100">
                        {t("view")}
                      </span>
                    </div>
                  </div>
                </button>
              </MediaFrame>
            </SectionReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="media-card relative max-h-[90vh] w-full max-w-md bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="media-frame media-frame--portrait max-h-[90vh]">
                <Image
                  src={galleryImages[active].src}
                  alt={galleryImages[active].alt}
                  fill
                  quality={95}
                  priority
                  sizes="420px"
                  className="media-img"
                />
              </div>
              <button
                type="button"
                className="absolute right-3 top-3 border border-[var(--line)] bg-black/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--gold-soft)]"
                onClick={() => setActive(null)}
                data-cursor="hover"
              >
                {t("close")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
