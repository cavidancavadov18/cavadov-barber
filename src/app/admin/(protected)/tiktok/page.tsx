"use client";

import { FormEvent, useState } from "react";
import { Field, apiJson, useAdminList } from "@/components/admin/CrudHelpers";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Item = {
  id: string;
  tiktokId: string;
  url: string;
  cover: string;
  titleAz: string;
  titleEn: string;
  focus: string;
  sortOrder: number;
};

const empty: Omit<Item, "id"> = {
  tiktokId: "",
  url: "",
  cover: "/media/unique/tt-01.jpg",
  titleAz: "",
  titleEn: "",
  focus: "object-center",
  sortOrder: 0,
};

export default function AdminTikTokPage() {
  const { items, loading, error, reload } = useAdminList<Item>("/api/admin/tiktok");
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
        await apiJson(`/api/admin/tiktok/${editId}`, { method: "PUT", body: JSON.stringify(form) });
        setMsg("Yeniləndi");
      } else {
        await apiJson("/api/admin/tiktok", { method: "POST", body: JSON.stringify(form) });
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
    await apiJson(`/api/admin/tiktok/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">TikTok</h1>
          <p className="admin-sub">Video kartları</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <form className="admin-form two" onSubmit={onSubmit}>
          <Field label="TikTok ID">
            <input
              value={form.tiktokId}
              onChange={(e) => setForm({ ...form, tiktokId: e.target.value })}
              required
            />
          </Field>
          <Field label="Sıra">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
          <Field label="URL" full>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
          </Field>
          <ImageUpload label="Cover" value={form.cover} onChange={(cover) => setForm({ ...form, cover })} />
          <Field label="Başlıq AZ">
            <input value={form.titleAz} onChange={(e) => setForm({ ...form, titleAz: e.target.value })} required />
          </Field>
          <Field label="Başlıq EN">
            <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required />
          </Field>
          <Field label="Focus" full>
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
              <th>Cover</th>
              <th>Başlıq</th>
              <th>ID</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="admin-thumb" src={item.cover} alt="" />
                </td>
                <td>{item.titleAz}</td>
                <td>{item.tiktokId}</td>
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
