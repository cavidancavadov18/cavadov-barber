"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { parseSectionHash } from "@/lib/section-ids";
import { openInstallPrompt } from "@/components/layout/InstallApp";

function goHome(scrollToMenu = false) {
  const { pathname, search } = window.location;
  window.history.pushState("", document.title, `${pathname}${search}`);
  window.dispatchEvent(new Event("hashchange"));
  window.setTimeout(() => {
    if (scrollToMenu) {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, 40);
}

export function MobileDock() {
  const t = useTranslations("dock");
  const tInstall = useTranslations("install");
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash.split("?")[0]);
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const section = parseSectionHash(hash);

  return (
    <nav
      className="mobile-dock fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[rgba(10,10,10,0.96)] px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md lg:hidden"
      aria-label={t("label")}
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        <button
          type="button"
          onClick={() => goHome(false)}
          className={`dock-item ${!section && hash !== "#menu" ? "is-active" : ""}`}
        >
          <span className="dock-ico" aria-hidden>
            ⌂
          </span>
          <span>{t("home")}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (section) goHome(true);
            else {
              window.location.hash = "menu";
              document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
          className={`dock-item ${hash === "#menu" ? "is-active" : ""}`}
        >
          <span className="dock-ico" aria-hidden>
            ≡
          </span>
          <span>{t("menu")}</span>
        </button>
        <a href="#booking" className={`dock-item ${section === "booking" ? "is-active" : ""}`}>
          <span className="dock-ico" aria-hidden>
            ✦
          </span>
          <span>{t("book")}</span>
        </a>
        <button type="button" onClick={() => openInstallPrompt()} className="dock-item dock-item--install">
          <span className="dock-ico" aria-hidden>
            ↓
          </span>
          <span>{tInstall("dock")}</span>
        </button>
      </div>
    </nav>
  );
}
