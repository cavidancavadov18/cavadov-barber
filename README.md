# CAVADOV BARBER

Premium animated bilingual (AZ/EN) barbershop website with online booking and WhatsApp confirmation.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Prisma + SQLite
- next-intl (AZ / EN)
- GSAP + Framer Motion + Lenis

## Setup

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/az`).

## Environment

Copy values from `.env`:

- `DATABASE_URL` — SQLite file path
- `WHATSAPP_NUMBER` / `NEXT_PUBLIC_WHATSAPP_NUMBER` — digits only, country code included
- `NEXT_PUBLIC_SITE_URL` — site origin

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run db:push` — sync Prisma schema
- `npm run db:seed` — seed barbers & services
