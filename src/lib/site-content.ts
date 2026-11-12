import { backendFetch } from "@/lib/backend";
import {
  ABOUT_IMAGE,
  BRAND_AVATAR,
  CONTACT,
  HERO_IMAGE,
  HERO_VIDEO,
  TIKTOK_PROFILE,
  beforeAfterPairs,
  galleryImages,
  reviews,
  tiktokVideos,
} from "@/lib/data/content";

export type SiteSettingsData = {
  addressAz: string;
  addressEn: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsapp: string;
  email: string;
  hoursAz: string;
  hoursEn: string;
  weekdayStart: number;
  weekdayEnd: number;
  sundayStart: number;
  sundayEnd: number;
  mapEmbedUrl: string;
  tiktokProfile: string;
  heroVideo: string;
  heroImage: string;
  aboutImage: string;
  brandAvatar: string;
};

export type GalleryItemData = {
  id: string;
  src: string;
  alt: string;
  labelAz: string;
  labelEn: string;
  focus: string;
};

export type ReviewData = {
  id: string;
  nameAz: string;
  nameEn: string;
  textAz: string;
  textEn: string;
  rating: number;
};

export type TikTokItemData = {
  id: string;
  url: string;
  cover: string;
  titleAz: string;
  titleEn: string;
  focus: string;
};

export type BeforeAfterData = {
  id: string;
  before: string;
  after: string;
  captionAz: string;
  captionEn: string;
  tiktokUrl: string | null;
};

export type WorkItemData = {
  id: string;
  kind: string;
  src: string;
  alt: string;
  labelAz: string;
  labelEn: string;
};

export type SiteContent = {
  settings: SiteSettingsData;
  gallery: GalleryItemData[];
  reviews: ReviewData[];
  tiktok: TikTokItemData[];
  beforeAfter: BeforeAfterData[];
  works: WorkItemData[];
};

const MAP_DEFAULT =
  "https://www.openstreetmap.org/export/embed.html?bbox=49.84%2C40.36%2C49.87%2C40.38&layer=mapnik&marker=40.370%2C49.855";

const fallbackSettings: SiteSettingsData = {
  addressAz: CONTACT.addressAz,
  addressEn: CONTACT.addressEn,
  phoneDisplay: CONTACT.phoneDisplay,
  phoneTel: CONTACT.phoneTel,
  whatsapp: CONTACT.whatsapp,
  email: CONTACT.email,
  hoursAz: CONTACT.hoursAz,
  hoursEn: CONTACT.hoursEn,
  weekdayStart: 10,
  weekdayEnd: 24,
  sundayStart: 10,
  sundayEnd: 24,
  mapEmbedUrl: MAP_DEFAULT,
  tiktokProfile: TIKTOK_PROFILE,
  heroVideo: HERO_VIDEO,
  heroImage: HERO_IMAGE,
  aboutImage: ABOUT_IMAGE,
  brandAvatar: BRAND_AVATAR,
};

const fallbackWorks: WorkItemData[] = [
  {
    id: "w1",
    kind: "banner",
    src: "/media/collage/polad-collage-1.jpg",
    alt: "POLAD BARBER",
    labelAz: "Usta iş başında",
    labelEn: "Master at work",
  },
  {
    id: "w2",
    kind: "banner",
    src: "/media/collage/polad-collage-3.jpg",
    alt: "POLAD BARBER",
    labelAz: "İmza kəsimlər",
    labelEn: "Signature looks",
  },
  { id: "w3", kind: "tile", src: "/media/unique/tt-02.jpg", alt: "Fade", labelAz: "Fade", labelEn: "Fade" },
  { id: "w4", kind: "tile", src: "/media/unique/tt-04.jpg", alt: "Skin Fade", labelAz: "Skin Fade", labelEn: "Skin Fade" },
  { id: "w5", kind: "tile", src: "/media/unique/tt-05.jpg", alt: "Line-up", labelAz: "Line-up", labelEn: "Line-up" },
  { id: "w6", kind: "tile", src: "/media/unique/tt-10.jpg", alt: "Classic", labelAz: "Classic", labelEn: "Classic" },
  { id: "w7", kind: "tile", src: "/media/unique/tt-12.jpg", alt: "Texture", labelAz: "Texture", labelEn: "Texture" },
  { id: "w8", kind: "tile", src: "/media/unique/tt-13.jpg", alt: "Clean Cut", labelAz: "Clean Cut", labelEn: "Clean Cut" },
  { id: "w9", kind: "tile", src: "/media/unique/tt-14.jpg", alt: "Finish", labelAz: "Finish", labelEn: "Finish" },
];

type ContentResponse = {
  settings: SiteSettingsData | null;
  gallery: GalleryItemData[];
  reviews: ReviewData[];
  tiktok: TikTokItemData[];
  beforeAfter: BeforeAfterData[];
  works: WorkItemData[];
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const data = await backendFetch<ContentResponse>("/api/content");
    return {
      settings: data.settings
        ? { ...data.settings, mapEmbedUrl: data.settings.mapEmbedUrl || MAP_DEFAULT }
        : fallbackSettings,
      gallery:
        data.gallery?.length > 0
          ? data.gallery
          : galleryImages.map((g, i) => ({
              id: `fallback-g-${i}`,
              src: g.src,
              alt: g.alt,
              labelAz: g.labelAz,
              labelEn: g.labelEn,
              focus: g.focus,
            })),
      reviews:
        data.reviews?.length > 0
          ? data.reviews
          : reviews.map((r) => ({
              id: r.id,
              nameAz: r.nameAz,
              nameEn: r.nameEn,
              textAz: r.textAz,
              textEn: r.textEn,
              rating: r.rating,
            })),
      tiktok:
        data.tiktok?.length > 0
          ? data.tiktok
          : tiktokVideos.map((t) => ({
              id: t.id,
              url: t.url,
              cover: t.cover,
              titleAz: t.titleAz,
              titleEn: t.titleEn,
              focus: t.focus,
            })),
      beforeAfter:
        data.beforeAfter?.length > 0
          ? data.beforeAfter
          : beforeAfterPairs.map((p, i) => ({
              id: `fallback-ba-${i}`,
              before: p.before,
              after: p.after,
              captionAz: p.captionAz,
              captionEn: p.captionEn,
              tiktokUrl: p.tiktokUrl,
            })),
      works: data.works?.length > 0 ? data.works : fallbackWorks,
    };
  } catch {
    return {
      settings: fallbackSettings,
      gallery: galleryImages.map((g, i) => ({
        id: `fallback-g-${i}`,
        src: g.src,
        alt: g.alt,
        labelAz: g.labelAz,
        labelEn: g.labelEn,
        focus: g.focus,
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        nameAz: r.nameAz,
        nameEn: r.nameEn,
        textAz: r.textAz,
        textEn: r.textEn,
        rating: r.rating,
      })),
      tiktok: tiktokVideos.map((t) => ({
        id: t.id,
        url: t.url,
        cover: t.cover,
        titleAz: t.titleAz,
        titleEn: t.titleEn,
        focus: t.focus,
      })),
      beforeAfter: beforeAfterPairs.map((p, i) => ({
        id: `fallback-ba-${i}`,
        before: p.before,
        after: p.after,
        captionAz: p.captionAz,
        captionEn: p.captionEn,
        tiktokUrl: p.tiktokUrl,
      })),
      works: fallbackWorks,
    };
  }
}
