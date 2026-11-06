"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HeroSmoke } from "@/components/ui/HeroSmoke";
import { useSiteContent } from "@/components/layout/SiteContentContext";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("hero");
  const { settings } = useSiteContent();
  const HERO_VIDEO = settings.heroVideo;
  const HERO_POSTER = settings.heroImage;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    if (!fine || reduceMotion || !wide) return;
    setUseVideo(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !useVideo) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    void video.play().catch(() => undefined);
  }, [useVideo]);

  const fadeUp = (delay = 0) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 42 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay: 0.25 + delay, ease },
        };

  return (
    <section className="relative flex min-h-[78svh] items-end overflow-hidden md:min-h-[100svh]">
      <div className="absolute inset-0">
        <div className={reduce ? "h-full w-full" : "hero-media h-full w-full"}>
          {useVideo ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={HERO_POSTER}
              controls={false}
              disablePictureInPicture
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={HERO_POSTER}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              quality={80}
            />
          )}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.34)_0%,rgba(10,10,10,0.52)_40%,rgba(10,10,10,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(10,10,10,0.58)_100%)]" />
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <HeroSmoke />
      </div>

      <div className="section-pad relative z-10 mx-auto w-full max-w-[1400px] pb-12 pt-28 md:pb-24 md:pt-36">
        <motion.p
          className="font-display text-[clamp(2rem,10vw,8.6rem)] leading-[0.94] tracking-[0.06em] text-[var(--gold-soft)]"
          {...fadeUp(0.05)}
        >
          {t("brand")}
        </motion.p>
        <motion.div className="gold-line gold-line--live mt-5 max-w-[12rem] md:mt-6 md:max-w-md" {...fadeUp(0.22)} />
        <motion.h1
          className="mt-6 max-w-2xl text-[clamp(1.15rem,4.2vw,2rem)] font-light tracking-wide text-[var(--text)] md:mt-8"
          {...fadeUp(0.32)}
        >
          {t("headline")}
        </motion.h1>
        <motion.p
          className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-[var(--text-muted)] md:max-w-lg md:text-base"
          {...fadeUp(0.42)}
        >
          {t("sub")}
        </motion.p>
        <motion.div
          className="mt-8 flex w-full flex-col gap-3.5 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
          {...fadeUp(0.55)}
        >
          <div className="w-full sm:w-auto">
            <MagneticButton href="#booking" className="btn-primary w-full sm:w-auto">
              <span>{t("cta")}</span>
              <span aria-hidden>→</span>
            </MagneticButton>
          </div>
          <div className="w-full sm:w-auto">
            <MagneticButton href="#menu" className="btn-ghost w-full sm:w-auto">
              <span>{t("explore")}</span>
            </MagneticButton>
          </div>
        </motion.div>
      </div>

      <a
        href="#menu"
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.58rem] uppercase tracking-[0.28em] text-[var(--gold-soft)] md:bottom-6"
      >
        <span className="scroll-cue h-7 w-px bg-[var(--gold)] md:h-8" />
        Menu
      </a>
    </section>
  );
}
