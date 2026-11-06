"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import type { ServiceItem } from "@/components/sections/Services";

export type BarberItem = {
  id: string;
  slug: string;
  nameAz: string;
  nameEn: string;
  roleAz: string;
  roleEn: string;
  bioAz: string;
  bioEn: string;
  image: string;
  experience: number;
};

export function Barbers({
  barbers,
  services = [],
}: {
  barbers: BarberItem[];
  services?: ServiceItem[];
}) {
  const t = useTranslations("barbers");
  const locale = useLocale();

  if (!barbers.length) return null;

  const sac = services.find((s) => s.slug === "sac");
  const saqqal = services.find((s) => s.slug === "saqqal");
  const cutPrice = sac ? `${sac.price} AZN` : "7 AZN";
  const beardPrice = saqqal ? `${saqqal.price} AZN` : "5 AZN";

  return (
    <section id="barbers" className="section-y relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#0c0c0c_0%,#141210_45%,#0a0a0a_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_380px_at_18%_25%,rgba(201,168,76,0.14),transparent_65%)]" />
      </div>

      <div className="section-pad relative container-site max-w-[1200px]">
        <SectionReveal>
          <p className="eyebrow">{t("eyebrow")}</p>
          <StaggerText text={t("title")} className="heading-lg mt-4" />
          <p className="mt-5 max-w-xl text-[var(--text-muted)]">{t("subtitle")}</p>
        </SectionReveal>

        <div className="mt-12 flex flex-col gap-8">
          {barbers.map((barber, i) => {
            const name = locale === "en" ? barber.nameEn : barber.nameAz;
            const role = locale === "en" ? barber.roleEn : barber.roleAz;
            const bio = locale === "en" ? barber.bioEn : barber.bioAz;
            return (
              <SectionReveal key={barber.id} delay={i * 0.05}>
                <article className="media-card mx-auto grid max-w-[980px] bg-[rgba(18,18,18,0.88)] lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="media-frame media-frame--portrait mx-auto w-full max-w-[340px] lg:max-w-none">
                    <Image
                      src={barber.image}
                      alt={name}
                      fill
                      quality={90}
                      sizes="(max-width:1024px) 340px, 40vw"
                      className="media-img"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
                    <div className="absolute left-4 top-4 border border-[var(--gold)]/50 bg-black/45 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-soft)]">
                      {t("masterBadge")}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-6 md:p-9 lg:p-11">
                    <p className="font-display text-[clamp(1.8rem,4vw,3rem)] leading-none tracking-[0.1em] text-[var(--gold-soft)]">
                      {role}
                    </p>
                    <div className="gold-line mt-5 max-w-[10rem]" />
                    <p className="mt-5 text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      {name} · {barber.experience} {t("years")}
                    </p>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
                      {bio}
                    </p>

                    <ul className="mt-7 grid gap-3 text-sm text-[var(--text)] sm:grid-cols-2">
                      <li className="border border-[var(--line)] bg-black/30 px-4 py-3">
                        <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-[var(--gold)]">
                          {t("priceCut")}
                        </span>
                        <span className="mt-1 font-display text-2xl text-[var(--gold-soft)]">
                          {cutPrice}
                        </span>
                      </li>
                      <li className="border border-[var(--line)] bg-black/30 px-4 py-3">
                        <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-[var(--gold)]">
                          {t("priceCombo")}
                        </span>
                        <span className="mt-1 font-display text-2xl text-[var(--gold-soft)]">
                          {beardPrice}
                        </span>
                      </li>
                    </ul>

                    <div className="mt-8">
                      <MagneticButton
                        href={`#booking?barber=${barber.slug}`}
                        className="btn-primary"
                      >
                        <span>{t("bookWith")}</span>
                        <span aria-hidden>→</span>
                      </MagneticButton>
                    </div>
                  </div>
                </article>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
