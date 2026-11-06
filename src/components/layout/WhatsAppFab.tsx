"use client";

import { useTranslations } from "next-intl";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useSiteContent } from "@/components/layout/SiteContentContext";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export function WhatsAppFab() {
  const t = useTranslations("whatsappFab");
  const { settings } = useSiteContent();
  const href = buildWhatsAppUrl(
    "Salam! CAVADOV BARBER rezervasiya üçün yazıram.",
    settings.whatsapp
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("label")}
      data-cursor="hover"
      className="wa-fab"
    >
      <WhatsAppIcon size={26} className="wa-fab__icon" />
    </a>
  );
}
