import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: { passwordHash: hashPassword("admin") },
    create: {
      username: "admin",
      passwordHash: hashPassword("admin"),
    },
  });

  await prisma.booking.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.service.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.tikTokVideo.deleteMany();
  await prisma.beforeAfter.deleteMany();
  await prisma.workItem.deleteMany();

  await prisma.barber.create({
    data: {
      slug: "polad-barber",
      nameAz: "Polad",
      nameEn: "Polad",
      roleAz: "POLAD BARBER",
      roleEn: "POLAD BARBER",
      bioAz:
        "CAVADOV BARBER-in ustası. Dəqiq kəsim, təmiz fade və saqqal forması ilə hər müştəriyə fərdi yanaşma.",
      bioEn:
        "Master barber at CAVADOV BARBER. Precision cuts, clean fades, and beard work with a personal approach.",
      image: "/media/hero-barber.jpg",
      experience: 5,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        slug: "sac",
        nameAz: "Saç",
        nameEn: "Haircut",
        descriptionAz: "Klassik və müasir saç kəsimi — dəqiq bitirmə ilə.",
        descriptionEn: "Classic and modern haircut with a clean finish.",
        price: 7,
        durationMin: 30,
        image: "/media/cuts/cut-03.jpg",
        sortOrder: 1,
      },
      {
        slug: "saqqal",
        nameAz: "Saqqal",
        nameEn: "Beard",
        descriptionAz: "Saqqal forması və səliqəli kontur.",
        descriptionEn: "Beard shaping and clean contour.",
        price: 5,
        durationMin: 20,
        image: "/media/cuts/cut-08.jpg",
        sortOrder: 2,
      },
      {
        slug: "bey-saci",
        nameAz: "Bəy Saçı",
        nameEn: "Groom Hair",
        descriptionAz: "Bəy saçı — toy / xüsusi gün üçün premium hazırlıq.",
        descriptionEn: "Groom hair — premium styling for the big day.",
        price: 70,
        durationMin: 90,
        image: "/media/services/bey-sac.jpg",
        sortOrder: 3,
      },
      {
        slug: "ukulatka",
        nameAz: "Ukulatka",
        nameEn: "Styling",
        descriptionAz: "Saç düzümü / fen ilə forma (ukladka).",
        descriptionEn: "Hair styling and blow-dry finish.",
        price: 5,
        durationMin: 20,
        image: "/media/services/ukladka.jpg",
        sortOrder: 4,
      },
      {
        slug: "maska",
        nameAz: "Maska",
        nameEn: "Mask",
        descriptionAz: "Üz / saç maskası — növə görə 5–10 AZN arası dəyişir.",
        descriptionEn: "Face / hair mask — 5–10 AZN depending on type.",
        price: 5,
        priceNoteAz: "5 – 10 AZN",
        priceNoteEn: "5 – 10 AZN",
        durationMin: 25,
        image: "/media/services/maska.jpg",
        sortOrder: 5,
      },
      {
        slug: "lipicka",
        nameAz: "Lipicka",
        nameEn: "Wax strip",
        descriptionAz: "Üzdə artıq tüklərin təmizlənməsi (lipicka).",
        descriptionEn: "Facial hair cleanup with wax strip.",
        price: 5,
        durationMin: 15,
        image: "/media/services/lipicka.jpg",
        sortOrder: 6,
      },
    ],
  });

  await prisma.galleryItem.createMany({
    data: [
      {
        src: "/media/cuts/cut-02.jpg",
        alt: "Line-up və fade — nəticə",
        labelAz: "Line-up",
        labelEn: "Line-up",
        focus: "object-top",
        sortOrder: 1,
      },
      {
        src: "/media/cuts/cut-04.jpg",
        alt: "Burst fade curly — nəticə",
        labelAz: "Burst Fade",
        labelEn: "Burst Fade",
        focus: "object-[center_25%]",
        sortOrder: 2,
      },
      {
        src: "/media/cuts/cut-06.jpg",
        alt: "Premium fade — nəticə",
        labelAz: "Premium Fade",
        labelEn: "Premium Fade",
        focus: "object-[center_32%]",
        sortOrder: 3,
      },
      {
        src: "/media/cuts/cut-09.jpg",
        alt: "Bowl / mill kəsim — nəticə",
        labelAz: "Mill",
        labelEn: "Bowl Cut",
        focus: "object-[center_28%]",
        sortOrder: 4,
      },
      {
        src: "/media/cuts/cut-10.jpg",
        alt: "Detal kəsim",
        labelAz: "Finish",
        labelEn: "Finish",
        focus: "object-[center_30%]",
        sortOrder: 5,
      },
      {
        src: "/media/extra/extra-02.jpg",
        alt: "Precision fade",
        labelAz: "Precision",
        labelEn: "Precision",
        focus: "object-center",
        sortOrder: 6,
      },
      {
        src: "/media/extra/extra-04.jpg",
        alt: "Saqqal grooming",
        labelAz: "Detal",
        labelEn: "Detail",
        focus: "object-center",
        sortOrder: 7,
      },
    ],
  });

  await prisma.beforeAfter.createMany({
    data: [
      {
        before: "/media/ba/before.jpg",
        after: "/media/ba/after.jpg",
        captionAz: "Deyişim edəndə belə dəyişim etmək lazımdır",
        captionEn: "When you transform, transform like this",
        tiktokUrl: "https://www.tiktok.com/@cavadov_barber/video/7693607413227851028",
        sortOrder: 1,
      },
      {
        before: "/media/unique/tt-15.jpg",
        after: "/media/unique/tt-08.jpg",
        captionAz: "Hansı yaraşır? İstəyinə uyğun kəsdik",
        captionEn: "Which suits better? Cut to your preference",
        tiktokUrl: "https://www.tiktok.com/@cavadov_barber/video/7682158694968069397",
        sortOrder: 2,
      },
    ],
  });

  await prisma.tikTokVideo.createMany({
    data: [
      {
        tiktokId: "7693607413227851028",
        url: "https://www.tiktok.com/@cavadov_barber/video/7693607413227851028",
        cover: "/media/unique/tt-01.jpg",
        titleAz: "Deyişim edəndə belə dəyişim etmək lazımdır",
        titleEn: "When you transform, transform like this",
        focus: "object-[center_35%]",
        sortOrder: 1,
      },
      {
        tiktokId: "7666598625157336341",
        url: "https://www.tiktok.com/@cavadov_barber/video/7666598625157336341",
        cover: "/media/unique/tt-15.jpg",
        titleAz: "Dəyişim necədir?",
        titleEn: "How is the transformation?",
        focus: "object-[center_30%]",
        sortOrder: 2,
      },
      {
        tiktokId: "7682158694968069397",
        url: "https://www.tiktok.com/@cavadov_barber/video/7682158694968069397",
        cover: "/media/unique/tt-08.jpg",
        titleAz: "Hansı yaraşır? İstəyinə uyğun kəsdik",
        titleEn: "Which suits better? Cut to your preference",
        focus: "object-[center_40%]",
        sortOrder: 3,
      },
      {
        tiktokId: "7675077554344119573",
        url: "https://www.tiktok.com/@cavadov_barber/video/7675077554344119573",
        cover: "/media/unique/tt-11.jpg",
        titleAz: "Mill kəsim",
        titleEn: "Bowl cut",
        focus: "object-top",
        sortOrder: 4,
      },
      {
        tiktokId: "7682066338017266965",
        url: "https://www.tiktok.com/@cavadov_barber/video/7682066338017266965",
        cover: "/media/unique/tt-09.jpg",
        titleAz: "Mil budu",
        titleEn: "Bowl style",
        focus: "object-[center_28%]",
        sortOrder: 5,
      },
      {
        tiktokId: "7684438991067680021",
        url: "https://www.tiktok.com/@cavadov_barber/video/7684438991067680021",
        cover: "/media/unique/tt-07.jpg",
        titleAz: "Hər gün sizi gözləyirik",
        titleEn: "Open for you every day",
        focus: "object-center",
        sortOrder: 6,
      },
      {
        tiktokId: "7599267824804105479",
        url: "https://www.tiktok.com/@cavadov_barber/video/7599267824804105479",
        cover: "/media/unique/tt-03.jpg",
        titleAz: "Təmiz fade nəticəsi",
        titleEn: "Clean fade result",
        focus: "object-top",
        sortOrder: 7,
      },
      {
        tiktokId: "7686657567614848276",
        url: "https://www.tiktok.com/@cavadov_barber/video/7686657567614848276",
        cover: "/media/unique/tt-06.jpg",
        titleAz: "Detallı kəsim",
        titleEn: "Detailed cut",
        focus: "object-top",
        sortOrder: 8,
      },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        nameAz: "Orxan R.",
        nameEn: "Orkhan R.",
        textAz: "Polad ustanın əli çox dəqiqdir. 7 AZN-ə bu keyfiyyət əladır.",
        textEn: "Polad's hand is very precise. This quality for 7 AZN is excellent.",
        rating: 5,
        sortOrder: 1,
      },
      {
        nameAz: "Camal H.",
        nameEn: "Jamal H.",
        textAz: "Saqqal 5 AZN — təmiz, sürətli və peşəkar.",
        textEn: "Beard for 5 AZN — clean, fast, and professional.",
        rating: 5,
        sortOrder: 2,
      },
      {
        nameAz: "Nurlan A.",
        nameEn: "Nurlan A.",
        textAz: "POLAD BARBER — Balaxanıda axtardığım yer budur.",
        textEn: "POLAD BARBER — exactly what I was looking for in Balakhani.",
        rating: 5,
        sortOrder: 3,
      },
      {
        nameAz: "Elçin M.",
        nameEn: "Elchin M.",
        textAz: "Fade-im çox təmiz alındı. Mütləq yenə gələcəyəm.",
        textEn: "My fade came out super clean. Definitely coming back.",
        rating: 5,
        sortOrder: 4,
      },
      {
        nameAz: "Ramin S.",
        nameEn: "Ramin S.",
        textAz: "Qiymət-keyfiyyət ideal. Tövsiyə edirəm.",
        textEn: "Perfect price-to-quality. Highly recommend.",
        rating: 5,
        sortOrder: 5,
      },
    ],
  });

  await prisma.workItem.createMany({
    data: [
      {
        kind: "banner",
        src: "/media/collage/polad-collage-1.jpg",
        alt: "POLAD BARBER",
        labelAz: "Usta iş başında",
        labelEn: "Master at work",
        sortOrder: 1,
      },
      {
        kind: "banner",
        src: "/media/collage/polad-collage-3.jpg",
        alt: "POLAD BARBER",
        labelAz: "İmza kəsimlər",
        labelEn: "Signature looks",
        sortOrder: 2,
      },
      {
        kind: "tile",
        src: "/media/unique/tt-02.jpg",
        alt: "Fade",
        labelAz: "Fade",
        labelEn: "Fade",
        sortOrder: 3,
      },
      {
        kind: "tile",
        src: "/media/unique/tt-04.jpg",
        alt: "Skin Fade",
        labelAz: "Skin Fade",
        labelEn: "Skin Fade",
        sortOrder: 4,
      },
      {
        kind: "tile",
        src: "/media/unique/tt-05.jpg",
        alt: "Line-up",
        labelAz: "Line-up",
        labelEn: "Line-up",
        sortOrder: 5,
      },
      {
        kind: "tile",
        src: "/media/unique/tt-10.jpg",
        alt: "Classic",
        labelAz: "Classic",
        labelEn: "Classic",
        sortOrder: 6,
      },
      {
        kind: "tile",
        src: "/media/unique/tt-12.jpg",
        alt: "Texture",
        labelAz: "Texture",
        labelEn: "Texture",
        sortOrder: 7,
      },
      {
        kind: "tile",
        src: "/media/unique/tt-13.jpg",
        alt: "Clean Cut",
        labelAz: "Clean Cut",
        labelEn: "Clean Cut",
        sortOrder: 8,
      },
      {
        kind: "tile",
        src: "/media/unique/tt-14.jpg",
        alt: "Finish",
        labelAz: "Finish",
        labelEn: "Finish",
        sortOrder: 9,
      },
    ],
  });

  const mapEmbedUrl =
    "https://www.openstreetmap.org/export/embed.html?bbox=49.84%2C40.36%2C49.87%2C40.38&layer=mapnik&marker=40.370%2C49.855";

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      addressAz: "Balaxanı, 6-cı mədən, Kafe Varın yanı, Bakı",
      addressEn: "Balakhani, 6th mine, near Cafe Varin, Baku",
      phoneDisplay: "055 353 53 68",
      phoneTel: "+994553535368",
      whatsapp: "994553535368",
      email: "hello@cavadovbarber.az",
      hoursAz: "Hər gün: 10:00 – 00:00",
      hoursEn: "Every day: 10:00 – 00:00",
      weekdayStart: 10,
      weekdayEnd: 24,
      sundayStart: 10,
      sundayEnd: 24,
      mapEmbedUrl,
      tiktokProfile: "https://www.tiktok.com/@cavadov_barber",
      heroVideo:
        "https://videos.pexels.com/video-files/3998746/3998746-uhd_2560_1440_25fps.mp4",
      heroImage: "/media/cuts/cut-05.jpg",
      aboutImage: "/media/extra/extra-01.jpg",
      brandAvatar: "/media/avatar.jpg",
    },
    create: {
      id: "main",
      addressAz: "Balaxanı, 6-cı mədən, Kafe Varın yanı, Bakı",
      addressEn: "Balakhani, 6th mine, near Cafe Varin, Baku",
      phoneDisplay: "055 353 53 68",
      phoneTel: "+994553535368",
      whatsapp: "994553535368",
      email: "hello@cavadovbarber.az",
      hoursAz: "Hər gün: 10:00 – 00:00",
      hoursEn: "Every day: 10:00 – 00:00",
      weekdayStart: 10,
      weekdayEnd: 24,
      sundayStart: 10,
      sundayEnd: 24,
      mapEmbedUrl,
      tiktokProfile: "https://www.tiktok.com/@cavadov_barber",
      heroVideo:
        "https://videos.pexels.com/video-files/3998746/3998746-uhd_2560_1440_25fps.mp4",
      heroImage: "/media/cuts/cut-05.jpg",
      aboutImage: "/media/extra/extra-01.jpg",
      brandAvatar: "/media/avatar.jpg",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
