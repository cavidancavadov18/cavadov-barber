export const SECTION_IDS = [
  "services",
  "barbers",
  "polad-works",
  "gallery",
  "tiktok",
  "before-after",
  "booking",
  "about",
  "reviews",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

export function parseSectionHash(hash: string): SectionId | null {
  const raw = hash.replace(/^#/, "").split("?")[0].trim();
  if (!raw || raw === "home" || raw === "top") return null;
  return isSectionId(raw) ? raw : null;
}
