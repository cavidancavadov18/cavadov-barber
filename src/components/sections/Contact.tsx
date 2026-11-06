"use client";

import { useTranslations } from "next-intl";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";
import { useSiteContent } from "@/components/layout/SiteContentContext";
import { useLocale } from "next-intl";

export function Contact() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const { settings } = useSiteContent();
  const CONTACT = settings;
  const TIKTOK_PROFILE = settings.tiktokProfile;
  const wa = buildWhatsAppUrl(
    "Salam! CAVADOV BARBER haqqında məlumat almaq istəyirəm.",
    settings.whatsapp
  );
  const address = locale === "en" ? settings.addressEn : settings.addressAz;
  const hours = locale === "en" ? settings.hoursEn : settings.hoursAz;
  const mapSrc = settings.mapEmbedUrl;

  return (
    <section id="contact" className="section-pad section-y">
      <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <SectionReveal>
          <p className="eyebrow">{t("eyebrow")}</p>
          <StaggerText text={t("title")} className="heading-lg mt-4" />
          <p className="mt-5 max-w-md text-[var(--text-muted)]">{t("subtitle")}</p>

          <dl className="mt-10 space-y-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
                {t("addressLabel")}
              </dt>
              <dd className="mt-2 text-[var(--text)]">{address}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
                {t("hoursLabel")}
              </dt>
              <dd className="mt-2 whitespace-pre-line text-[var(--text)]">{hours}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
                {t("phoneLabel")}
              </dt>
              <dd className="mt-2">
                <a href={`tel:${CONTACT.phoneTel}`} className="text-[var(--text)] hover:text-[var(--gold-soft)]" data-cursor="hover">
                  {CONTACT.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
                {t("emailLabel")}
              </dt>
              <dd className="mt-2">
                <a href={`mailto:${CONTACT.email}`} className="text-[var(--text)] hover:text-[var(--gold-soft)]" data-cursor="hover">
                  {CONTACT.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">TikTok</dt>
              <dd className="mt-2">
                <a
                  href={TIKTOK_PROFILE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text)] hover:text-[var(--gold-soft)]"
                  data-cursor="hover"
                >
                  @cavadov_barber
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <MagneticButton href={wa} className="btn-primary" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} />
              <span>{t("whatsapp")}</span>
            </MagneticButton>
            <MagneticButton
              href={TIKTOK_PROFILE}
              className="btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>TikTok</span>
            </MagneticButton>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="media-card media-frame media-frame--landscape min-h-[280px] sm:min-h-0">
            <iframe
              title={t("mapTitle")}
              className="absolute inset-0 h-full w-full grayscale contrast-125 invert-[0.88]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
            />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
