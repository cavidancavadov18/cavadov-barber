"use client";

import { useState } from "react";

export function ImageUpload({
  value,
  onChange,
  label = "Şəkil yüklə",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xəta");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-field full">
      <label>{label}</label>
      <div className="admin-actions" style={{ alignItems: "center" }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/media/..."
          style={{ flex: 1, minWidth: 0 }}
        />
        <label className="admin-btn" style={{ cursor: busy ? "wait" : "pointer" }}>
          {busy ? "..." : "Upload"}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="admin-thumb" src={value} alt="" style={{ marginTop: 8 }} />
      ) : null}
    </div>
  );
}
