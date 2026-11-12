import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeExperience } from "@/components/layout/HomeExperience";
import { backendFetch } from "@/lib/backend";

export const dynamic = "force-dynamic";

type Catalog = {
  services: Parameters<typeof HomeExperience>[0]["services"];
  barbers: Parameters<typeof HomeExperience>[0]["barbers"];
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "marquee" });

  let services: Catalog["services"] = [];
  let barbers: Catalog["barbers"] = [];
  try {
    const catalog = await backendFetch<Catalog>("/api/catalog");
    services = catalog.services || [];
    barbers = catalog.barbers || [];
  } catch {
    services = [];
    barbers = [];
  }

  return (
    <main>
      <HomeExperience services={services} barbers={barbers} marqueeText={t("text")} />
    </main>
  );
}
