"use client";

import { useEffect, useState } from "react";

type LoadingScreenProps = {
  label: string;
};

/** Short flash only on first visit — keeps first paint fast */
export function LoadingScreen({ label }: LoadingScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("cb-loaded")) return;
      sessionStorage.setItem("cb-loaded", "1");
    } catch {
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[var(--bg)]">
      <p className="font-display text-3xl tracking-[0.28em] text-[var(--gold-soft)]">CAVADOV</p>
      <p className="mt-2 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
