"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";
import { useSiteContent } from "@/components/layout/SiteContentContext";

function CompareSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  title,
}: {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  title: string;
}) {
  const [pos, setPos] = useState(52);
  const dragging = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const update = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, next)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!wrapRef.current) return;
      if (document.activeElement !== wrapRef.current) return;
      if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - 3));
      if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + 3));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <MediaFrame className="media-card mx-auto max-w-[540px] p-2 md:p-3">
      <div
        ref={wrapRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={4}
        aria-valuemax={96}
        aria-valuenow={Math.round(pos)}
        aria-label={title}
        className="media-frame media-frame--portrait select-none touch-none outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)]"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          update(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          update(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <Image src={after} alt={afterLabel} fill quality={92} sizes="540px" className="media-img" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={before} alt={beforeLabel} fill quality={92} sizes="540px" className="media-img" />
        </div>
        <div className="absolute inset-y-0 z-10 w-px bg-[var(--gold)]" style={{ left: `${pos}%` }}>
          <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[var(--gold)] bg-[var(--bg)] text-[var(--gold-soft)]">
            ↔
          </div>
        </div>
        <span className="absolute left-3 top-3 border border-[var(--line)] bg-black/65 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--gold-soft)]">
          {beforeLabel}
        </span>
        <span className="absolute right-3 top-3 border border-[var(--line)] bg-black/65 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--gold-soft)]">
          {afterLabel}
        </span>
      </div>
    </MediaFrame>
  );
}

export function BeforeAfter() {
  const t = useTranslations("beforeAfter");
  const locale = useLocale();
  const { beforeAfter, settings } = useSiteContent();

  if (!beforeAfter.length) return null;

  return (
    <section id="before-after" className="section-y relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--bg-elevated)]" />
      <div className="section-pad relative container-site max-w-[980px]">
        <SectionReveal>
          <p className="eyebrow">{t("eyebrow")}</p>
          <StaggerText text={t("title")} className="heading-lg mt-4" />
          <p className="mt-5 max-w-xl text-[var(--text-muted)]">{t("subtitle")}</p>
        </SectionReveal>

        <div className="mt-12 flex flex-col gap-14">
          {beforeAfter.map((pair, i) => {
            const caption = locale === "en" ? pair.captionEn : pair.captionAz;
            return (
              <SectionReveal key={pair.id} delay={i * 0.04}>
                <CompareSlider
                  before={pair.before}
                  after={pair.after}
                  beforeLabel={t("before")}
                  afterLabel={t("after")}
                  title={t("title")}
                />
                <div className="mt-6 text-center">
                  <p className="font-display text-lg tracking-[0.04em] text-[var(--gold-soft)] md:text-xl">
                    {caption}
                  </p>
                  {pair.tiktokUrl ? (
                    <a
                      href={pair.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-xs uppercase tracking-[0.2em] text-[var(--gold)]"
                    >
                      TikTok →
                    </a>
                  ) : (
                    <a
                      href={settings.tiktokProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-xs uppercase tracking-[0.2em] text-[var(--gold)]"
                    >
                      TikTok →
                    </a>
                  )}
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
