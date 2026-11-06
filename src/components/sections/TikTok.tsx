"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";
import { useSiteContent } from "@/components/layout/SiteContentContext";

export function TikTok() {
  const t = useTranslations("tiktok");
  const locale = useLocale();
  const { tiktok: tiktokVideos, settings } = useSiteContent();
  const TIKTOK_PROFILE = settings.tiktokProfile;

  return (
    <section id="tiktok" className="section-y relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--bg)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_420px_at_50%_0%,rgba(201,168,76,0.1),transparent_60%)]" />

      <div className="section-pad relative container-site">
        <SectionReveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">{t("eyebrow")}</p>
              <StaggerText text={t("title")} className="heading-lg mt-4" />
              <p className="mt-5 max-w-xl text-[var(--text-muted)]">{t("subtitle")}</p>
            </div>
            <a
              href={TIKTOK_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              data-cursor="hover"
            >
              {t("follow")} →
            </a>
          </div>
        </SectionReveal>

        <div className="media-grid media-grid--4 mt-12">
          {tiktokVideos.map((video, i) => (
            <SectionReveal key={video.id} delay={i * 0.04}>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="media-card group block transition hover:border-[var(--gold)]/55"
              >
                <div className="media-frame media-frame--reel">
                  <Image
                    src={video.cover}
                    alt={locale === "en" ? video.titleEn : video.titleAz}
                    fill
                    quality={94}
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                    className={`media-img ${video.focus || "object-center"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/15" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center border border-[var(--gold)]/70 bg-black/50 text-sm text-[var(--gold-soft)]">
                      ▶
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[var(--gold)]">
                      TikTok
                    </p>
                    <p className="mt-1 line-clamp-3 font-display text-sm leading-snug tracking-[0.03em] text-[var(--gold-soft)] md:text-[0.95rem]">
                      {locale === "en" ? video.titleEn : video.titleAz}
                    </p>
                  </div>
                </div>
              </a>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
