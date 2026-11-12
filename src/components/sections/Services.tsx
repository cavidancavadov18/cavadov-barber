"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";

export type ServiceItem = {
  id: string;
  slug: string;
  nameAz: string;
  nameEn: string;
  descriptionAz: string;
  descriptionEn: string;
  price: number;
  priceNoteAz?: string | null;
  priceNoteEn?: string | null;
  durationMin: number;
  image: string;
};

function priceLabel(service: ServiceItem, locale: string) {
  const note = locale === "en" ? service.priceNoteEn : service.priceNoteAz;
  if (note) return note;
  return `${service.price} AZN`;
}

export function Services({ services }: { services: ServiceItem[] }) {
  const t = useTranslations("services");
  const locale = useLocale();

  return (
    <section id="services" className="section-pad section-y relative">
      <div className="container-site max-w-[920px]">
        <SectionReveal>
          <p className="eyebrow">{t("eyebrow")}</p>
          <StaggerText text={t("title")} className="heading-lg mt-4 max-w-3xl" />
          <p className="mt-5 max-w-xl text-[var(--text-muted)]">{t("subtitle")}</p>
        </SectionReveal>

        <SectionReveal delay={0.06} className="mt-10 md:mt-12">
          <div className="overflow-hidden">
            <div className="mb-5 md:mb-6">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">
                {locale === "en" ? "Price list" : "Qiymət siyahısı"}
              </p>
            </div>

            <ul className="flex flex-col gap-3.5 md:gap-5">
              {services.map((service) => {
                const name = locale === "en" ? service.nameEn : service.nameAz;
                const desc = locale === "en" ? service.descriptionEn : service.descriptionAz;
                return (
                  <li key={service.id}>
                    <a
                      href={`#booking?service=${service.slug}`}
                      data-cursor="hover"
                      className="group flex items-start gap-4 border border-[var(--line)] bg-[var(--surface)] px-4 py-[1.2rem] transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/45 hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)] sm:px-5 md:items-center md:gap-6 md:px-6 md:py-6"
                    >
                      <div className="media-frame media-frame--thumb overflow-hidden border border-[var(--line)]">
                        <Image
                          src={service.image}
                          alt={name}
                          fill
                          sizes="64px"
                          className="media-img"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
                          <h3 className="font-display text-xl tracking-[0.06em] text-[var(--gold-soft)] md:text-2xl">
                            {name}
                          </h3>
                          <p className="shrink-0 font-display text-lg tracking-[0.04em] text-[var(--gold-soft)] md:text-xl">
                            {priceLabel(service, locale)}
                          </p>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{desc}</p>
                        <p className="mt-3 text-[0.65rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          {service.durationMin} {t("min")}
                          <span className="ml-3 text-[var(--gold)] md:opacity-0 md:transition md:group-hover:opacity-100">
                            {t("book")} →
                          </span>
                        </p>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
