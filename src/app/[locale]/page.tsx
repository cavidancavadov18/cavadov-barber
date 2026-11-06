import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeExperience } from "@/components/layout/HomeExperience";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "marquee" });

  const [services, barbers] = await Promise.all([
    prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.barber.findMany({ orderBy: { experience: "desc" } }),
  ]);

  return (
    <main>
      <HomeExperience services={services} barbers={barbers} marqueeText={t("text")} />
    </main>
  );
}
