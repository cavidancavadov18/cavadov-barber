"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg-elevated)] pb-24 lg:pb-0">
      <div className="section-pad mx-auto flex max-w-[1400px] flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl tracking-[0.28em] text-[var(--gold-soft)]">
            CAVADOV BARBER
          </p>
          <p className="mt-3 max-w-sm text-sm text-[var(--text-muted)]">{t("tagline")}</p>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
          © {year} Cavadov Barber. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
