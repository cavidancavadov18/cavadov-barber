"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useSiteContent } from "@/components/layout/SiteContentContext";

export function PoladWorks() {
  const t = useTranslations("poladWorks");
  const locale = useLocale();
  const { works } = useSiteContent();
  const banners = works.filter((w) => w.kind === "banner");
  const tiles = works.filter((w) => w.kind !== "banner");

  return (
    <section id="polad-works" className="section-y relative overflow-hidden bg-[var(--bg-elevated)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_50%_-10%,rgba(201,168,76,0.12),transparent_55%)]" />
      <div className="section-pad relative container-site">
        <SectionReveal>
          <p className="eyebrow">{t("eyebrow")}</p>
          <StaggerText text={t("title")} className="heading-lg mt-4" />
          <p className="mt-5 max-w-2xl text-[var(--text-muted)]">{t("subtitle")}</p>
        </SectionReveal>

        {banners.length > 0 ? (
          <div className="media-grid media-grid--2 mt-12">
            {banners.map((banner, i) => (
              <SectionReveal key={banner.id} delay={i * 0.06}>
                <div className="media-card group relative">
                  <div className="media-frame media-frame--landscape">
                    <Image
                      src={banner.src}
                      alt={banner.alt}
                      fill
                      quality={92}
                      sizes="(max-width:768px) 100vw, 50vw"
                      className="media-img"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[var(--gold)]">
                        POLAD BARBER
                      </p>
                      <p className="mt-2 font-display text-lg tracking-[0.08em] text-[var(--gold-soft)] md:text-xl">
                        {locale === "en" ? banner.labelEn : banner.labelAz}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        ) : null}

        {tiles.length > 0 ? (
          <>
            <SectionReveal className="mt-16">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
                <div>
                  <p className="eyebrow">{t("mergeEyebrow")}</p>
                  <h3 className="mt-3 font-display text-2xl tracking-[0.08em] text-[var(--gold-soft)] md:text-3xl">
                    {t("mergeTitle")}
                  </h3>
                </div>
              </div>
            </SectionReveal>
            <div className="media-grid media-grid--4 mt-8">
              {tiles.map((tile, i) => (
                <SectionReveal key={tile.id} delay={i * 0.03}>
                  <article className="media-card group relative">
                    <div className="media-frame media-frame--portrait">
                      <Image
                        src={tile.src}
                        alt={locale === "en" ? tile.labelEn : tile.labelAz}
                        fill
                        quality={90}
                        sizes="(max-width:640px) 50vw, 25vw"
                        className="media-img"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                        <p className="text-[0.58rem] uppercase tracking-[0.18em] text-[var(--gold)]">
                          {t("result")}
                        </p>
                        <p className="mt-1 font-display text-sm tracking-[0.06em] text-[var(--gold-soft)] md:text-base">
                          {locale === "en" ? tile.labelEn : tile.labelAz}
                        </p>
                      </div>
                    </div>
                  </article>
                </SectionReveal>
              ))}
            </div>
          </>
        ) : null}

        <div className="mt-12 flex justify-center">
          <MagneticButton href="#booking" className="btn-primary">
            <span>{t("cta")}</span>
            <span aria-hidden>→</span>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
