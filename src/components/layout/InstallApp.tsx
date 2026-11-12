"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const APK_URL = "/downloads/cavadov-barber.apk";

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

async function registerSw() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    return reg;
  } catch {
    return null;
  }
}

function downloadApk() {
  const a = document.createElement("a");
  a.href = APK_URL;
  a.download = "cavadov-barber.apk";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function InstallApp() {
  const t = useTranslations("install");
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"android" | "ios" | "desktop" | "done">("android");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) {
      setMode("done");
      return;
    }

    void registerSw();

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => {
      setVisible(false);
      setMode("done");
    });

    if (localStorage.getItem("cavadov-install-dismissed") === "1") {
      return () => window.removeEventListener("beforeinstallprompt", onPrompt);
    }

    if (isIos()) {
      setMode("ios");
      setVisible(true);
    } else if (isAndroid() || window.matchMedia("(max-width: 1023px)").matches) {
      setMode("android");
      setVisible(true);
    } else {
      setMode("desktop");
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  useEffect(() => {
    const open = () => {
      if (isStandalone()) return;
      localStorage.removeItem("cavadov-install-dismissed");
      if (isIos()) setMode("ios");
      else setMode("android");
      setVisible(true);
    };
    window.addEventListener("cavadov-open-install", open);
    return () => window.removeEventListener("cavadov-open-install", open);
  }, []);

  function dismiss() {
    localStorage.setItem("cavadov-install-dismissed", "1");
    setVisible(false);
  }

  async function onPrimary() {
    if (mode === "ios") {
      dismiss();
      return;
    }

    // Direct APK download (Android / desktop)
    setBusy(true);
    try {
      downloadApk();
      // Also try native PWA prompt if available
      const ev = deferredRef.current;
      if (ev) {
        try {
          await ev.prompt();
          await ev.userChoice;
        } catch {
          /* ignore */
        }
      }
    } finally {
      setBusy(false);
    }
  }

  if (!visible || mode === "done") return null;

  const subtitle = mode === "ios" ? t("iosHint") : t("apkHint");

  return (
    <div className="install-banner" role="dialog" aria-label={t("title")}>
      <div className="install-banner__inner">
        <div className="install-banner__text">
          <p className="install-banner__title">{t("title")}</p>
          <p className="install-banner__sub">{subtitle}</p>
        </div>
        <div className="install-banner__actions">
          <button type="button" className="install-banner__btn" onClick={onPrimary} disabled={busy}>
            {busy ? "..." : mode === "ios" ? t("gotIt") : t("download")}
          </button>
          <button type="button" className="install-banner__close" onClick={dismiss} aria-label={t("later")}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export function openInstallPrompt() {
  if (typeof window === "undefined") return;
  // On Android dock: start download immediately
  if (isAndroid()) {
    downloadApk();
  }
  window.dispatchEvent(new Event("cavadov-open-install"));
}
