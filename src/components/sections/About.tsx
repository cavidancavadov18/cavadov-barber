"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ParallaxMedia } from "@/components/ui/ParallaxMedia";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";
import { useSiteContent } from "@/components/layout/SiteContentContext";

export function About() {
  const t = useTranslations("about");
  const { settings } = useSiteContent();
  const ABOUT_IMAGE = settings.aboutImage;

  return (
    <section id="about" className="section-pad section-y">
      <div className="container-site grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionReveal>
          <div className="media-card">
            <ParallaxMedia className="media-frame media-frame--portrait" speed={0.12}>
              <Image
                src={ABOUT_IMAGE}
                alt="CAVADOV BARBER interior"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="media-img"
                quality={94}
              />
            </ParallaxMedia>
          </div>
        </SectionReveal>

        <div>
          <SectionReveal>
            <p className="eyebrow">{t("eyebrow")}</p>
            <StaggerText text={t("title")} className="heading-lg mt-4" />
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-muted)]">{t("p1")}</p>
            <p className="mt-4 leading-relaxed text-[var(--text-muted)]">{t("p2")}</p>
          </SectionReveal>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-8">
            {[
              [t("stat1"), t("stat1Label")],
              [t("stat2"), t("stat2Label")],
              [t("stat3"), t("stat3Label")],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-3xl text-[var(--gold-soft)] md:text-4xl">{value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
