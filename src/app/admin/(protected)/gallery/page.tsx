"use client";

import { FormEvent, useState } from "react";
import { Field, apiJson, useAdminList } from "@/components/admin/CrudHelpers";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Item = {
  id: string;
  src: string;
  alt: string;
  labelAz: string;
  labelEn: string;
  focus: string;
  sortOrder: number;
};

const empty: Omit<Item, "id"> = {
  src: "/media/cuts/cut-02.jpg",
  alt: "",
  labelAz: "",
  labelEn: "",
  focus: "object-center",
  sortOrder: 0,
};

export default function AdminGalleryPage() {
  const { items, loading, error, reload } = useAdminList<Item>("/api/admin/gallery");
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function startEdit(item: Item) {
    setEditId(item.id);
    const { id: _id, ...rest } = item;
    setForm(rest);
  }

  function reset() {
    setEditId(null);
    setForm(empty);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      if (editId) {
        await apiJson(`/api/admin/gallery/${editId}`, { method: "PUT", body: JSON.stringify(form) });
        setMsg("Yeniləndi");
      } else {
        await apiJson("/api/admin/gallery", { method: "POST", body: JSON.stringify(form) });
        setMsg("Əlavə olundu");
      }
      reset();
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Xəta");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Silinsin?")) return;
    await apiJson(`/api/admin/gallery/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Qalereya</h1>
          <p className="admin-sub">Sayt qalereya şəkilləri</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <form className="admin-form two" onSubmit={onSubmit}>
          <ImageUpload label="Şəkil" value={form.src} onChange={(src) => setForm({ ...form, src })} />
          <Field label="Alt">
            <input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} required />
          </Field>
          <Field label="Sıra">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
          <Field label="Label AZ">
            <input value={form.labelAz} onChange={(e) => setForm({ ...form, labelAz: e.target.value })} required />
          </Field>
          <Field label="Label EN">
            <input value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} required />
          </Field>
          <Field label="Focus class" full>
            <input value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} />
          </Field>
          <div className="admin-actions full">
            <button className="admin-btn primary" disabled={busy}>
              {editId ? "Yenilə" : "Əlavə et"}
            </button>
            {editId ? (
              <button type="button" className="admin-btn" onClick={reset}>
                Ləğv
              </button>
            ) : null}
            {msg ? <span className="admin-ok">{msg}</span> : null}
          </div>
        </form>
      </div>

      {loading ? <p className="admin-sub">Yüklənir...</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Şəkil</th>
              <th>Label</th>
              <th>Sıra</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="admin-thumb" src={item.src} alt="" />
                </td>
                <td>
                  {item.labelAz}
                  <div style={{ color: "var(--a-muted)", fontSize: "0.8rem" }}>{item.src}</div>
                </td>
                <td>{item.sortOrder}</td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="admin-btn danger" onClick={() => onDelete(item.id)}>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
