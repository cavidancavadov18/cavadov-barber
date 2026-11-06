"use client";

import { About } from "@/components/sections/About";
import { Barbers, type BarberItem } from "@/components/sections/Barbers";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Booking } from "@/components/sections/Booking";
import { Contact } from "@/components/sections/Contact";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { PoladWorks } from "@/components/sections/PoladWorks";
import { Reviews } from "@/components/sections/Reviews";
import { Services, type ServiceItem } from "@/components/sections/Services";
import { TikTok } from "@/components/sections/TikTok";
import { Marquee } from "@/components/ui/Marquee";
import { MobileHomeMenu } from "@/components/layout/MobileHomeMenu";
import {
  SectionChrome,
  SectionProvider,
  useSectionNav,
} from "@/components/layout/SectionPanel";
import type { SectionId } from "@/lib/section-ids";

type HomeExperienceProps = {
  services: ServiceItem[];
  barbers: BarberItem[];
  marqueeText: string;
};

function ActiveSection({
  id,
  services,
  barbers,
}: {
  id: SectionId;
  services: ServiceItem[];
  barbers: BarberItem[];
}) {
  switch (id) {
    case "services":
      return <Services services={services} />;
    case "barbers":
      return <Barbers barbers={barbers} services={services} />;
    case "polad-works":
      return <PoladWorks />;
    case "gallery":
      return <Gallery />;
    case "tiktok":
      return <TikTok />;
    case "before-after":
      return <BeforeAfter />;
    case "booking":
      return <Booking services={services} barbers={barbers} />;
    case "about":
      return <About />;
    case "reviews":
      return <Reviews />;
    case "contact":
      return <Contact />;
    default:
      return null;
  }
}

function HomeInner({ services, barbers, marqueeText }: HomeExperienceProps) {
  const { active } = useSectionNav();

  if (!active) {
    return (
      <>
        <Hero />
        <Marquee text={marqueeText} />
        <MobileHomeMenu />
      </>
    );
  }

  return (
    <SectionChrome active={active}>
      <ActiveSection id={active} services={services} barbers={barbers} />
    </SectionChrome>
  );
}

export function HomeExperience(props: HomeExperienceProps) {
  return (
    <SectionProvider>
      <HomeInner {...props} />
    </SectionProvider>
  );
}
