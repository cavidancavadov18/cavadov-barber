"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { parseSectionHash, type SectionId } from "@/lib/section-ids";

type SectionContextValue = {
  active: SectionId | null;
  openSection: (id: SectionId, query?: string) => void;
  closeSection: () => void;
};

const SectionContext = createContext<SectionContextValue | null>(null);

export function useSectionNav() {
  const ctx = useContext(SectionContext);
  if (!ctx) throw new Error("useSectionNav must be used within SectionProvider");
  return ctx;
}

export function useSectionNavOptional() {
  return useContext(SectionContext);
}

export function SectionProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<SectionId | null>(null);

  const syncFromHash = useCallback(() => {
    setActive(parseSectionHash(window.location.hash));
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, [syncFromHash]);

  useEffect(() => {
    if (!active) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [active]);

  const openSection = useCallback((id: SectionId, query = "") => {
    const next = query ? `#${id}?${query}` : `#${id}`;
    if (window.location.hash === next) {
      setActive(id);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    window.location.hash = next;
  }, []);

  const closeSection = useCallback(() => {
    const { pathname, search } = window.location;
    window.history.pushState("", document.title, `${pathname}${search}`);
    setActive(null);
    window.dispatchEvent(new Event("hashchange"));
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const value = useMemo(
    () => ({ active, openSection, closeSection }),
    [active, openSection, closeSection]
  );

  return <SectionContext.Provider value={value}>{children}</SectionContext.Provider>;
}

export function SectionChrome({
  active,
  children,
}: {
  active: SectionId | null;
  onClose?: () => void;
  children: ReactNode;
}) {
  if (!active) return null;

  return (
    <div className="min-h-[100svh] bg-[var(--bg)] pb-36 pt-28 md:pb-12 md:pt-28">{children}</div>
  );
}
