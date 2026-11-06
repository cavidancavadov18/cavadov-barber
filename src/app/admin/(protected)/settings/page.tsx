"use client";

import { FormEvent, useEffect, useState } from "react";
import { Field, apiJson } from "@/components/admin/CrudHelpers";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Settings = {
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

const empty: Settings = {
  addressAz: "",
  addressEn: "",
  phoneDisplay: "",
  phoneTel: "",
  whatsapp: "",
  email: "",
  hoursAz: "",
  hoursEn: "",
  weekdayStart: 10,
  weekdayEnd: 24,
  sundayStart: 10,
  sundayEnd: 24,
  mapEmbedUrl: "",
  tiktokProfile: "",
  heroVideo: "",
  heroImage: "",
  aboutImage: "",
  brandAvatar: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(empty);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    apiJson<Settings | null>("/api/admin/settings")
      .then((data) => {
        if (data) setForm({ ...empty, ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await apiJson("/api/admin/settings", { method: "PUT", body: JSON.stringify(form) });
      setMsg("Yadda saxlanıldı");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Xəta");
    } finally {
      setBusy(false);
    }
  }

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg("");
    try {
      await apiJson("/api/admin/password", { method: "PUT", body: JSON.stringify(pw) });
      setPwMsg("Şifrə yeniləndi");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : "Xəta");
    }
  }

  if (loading) return <p className="admin-sub">Yüklənir...</p>;

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Ayarlar</h1>
          <p className="admin-sub">Kontakt, saat, media və xəritə</p>
        </div>
      </div>

      <div className="admin-card">
        <form className="admin-form two" onSubmit={onSubmit}>
          <Field label="Ünvan AZ" full>
            <input value={form.addressAz} onChange={(e) => setForm({ ...form, addressAz: e.target.value })} required />
          </Field>
          <Field label="Ünvan EN" full>
            <input value={form.addressEn} onChange={(e) => setForm({ ...form, addressEn: e.target.value })} required />
          </Field>
          <Field label="Telefon (görünən)">
            <input value={form.phoneDisplay} onChange={(e) => setForm({ ...form, phoneDisplay: e.target.value })} required />
          </Field>
          <Field label="Telefon (tel:)">
            <input value={form.phoneTel} onChange={(e) => setForm({ ...form, phoneTel: e.target.value })} required />
          </Field>
          <Field label="WhatsApp">
            <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
          <Field label="İş saatı mətni AZ" full>
            <textarea value={form.hoursAz} onChange={(e) => setForm({ ...form, hoursAz: e.target.value })} required />
          </Field>
          <Field label="İş saatı mətni EN" full>
            <textarea value={form.hoursEn} onChange={(e) => setForm({ ...form, hoursEn: e.target.value })} required />
          </Field>
          <Field label="Həftə içi start">
            <input type="number" value={form.weekdayStart} onChange={(e) => setForm({ ...form, weekdayStart: Number(e.target.value) })} />
          </Field>
          <Field label="Həftə içi end">
            <input type="number" value={form.weekdayEnd} onChange={(e) => setForm({ ...form, weekdayEnd: Number(e.target.value) })} />
          </Field>
          <Field label="Bazar start">
            <input type="number" value={form.sundayStart} onChange={(e) => setForm({ ...form, sundayStart: Number(e.target.value) })} />
          </Field>
          <Field label="Bazar end">
            <input type="number" value={form.sundayEnd} onChange={(e) => setForm({ ...form, sundayEnd: Number(e.target.value) })} />
          </Field>
          <Field label="Xəritə embed URL" full>
            <textarea value={form.mapEmbedUrl} onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })} required />
          </Field>
          <Field label="TikTok profil" full>
            <input value={form.tiktokProfile} onChange={(e) => setForm({ ...form, tiktokProfile: e.target.value })} required />
          </Field>
          <Field label="Hero video URL" full>
            <input value={form.heroVideo} onChange={(e) => setForm({ ...form, heroVideo: e.target.value })} />
          </Field>
          <ImageUpload label="Hero şəkil" value={form.heroImage} onChange={(heroImage) => setForm({ ...form, heroImage })} />
          <ImageUpload label="About şəkil" value={form.aboutImage} onChange={(aboutImage) => setForm({ ...form, aboutImage })} />
          <ImageUpload label="Brand avatar" value={form.brandAvatar} onChange={(brandAvatar) => setForm({ ...form, brandAvatar })} />
          <div className="admin-actions full">
            <button className="admin-btn primary" disabled={busy}>
              Saxla
            </button>
            {msg ? <span className="admin-ok">{msg}</span> : null}
          </div>
        </form>
      </div>

      <div className="admin-card" style={{ marginTop: "1.25rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Admin şifrə</h2>
        <form className="admin-form two" onSubmit={onPassword}>
          <Field label="Cari şifrə">
            <input
              type="password"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              required
            />
          </Field>
          <Field label="Yeni şifrə">
            <input
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </Field>
          <div className="admin-actions full">
            <button className="admin-btn primary" type="submit">
              Şifrəni dəyiş
            </button>
            {pwMsg ? <span className={pwMsg.includes("yeniləndi") ? "admin-ok" : "admin-error"}>{pwMsg}</span> : null}
          </div>
        </form>
      </div>
    </>
  );
}
