"use client";

import { FormEvent, useState } from "react";
import { Field, apiJson, useAdminList } from "@/components/admin/CrudHelpers";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Item = {
  id: string;
  before: string;
  after: string;
  captionAz: string;
  captionEn: string;
  tiktokUrl: string | null;
  sortOrder: number;
};

const empty: Omit<Item, "id"> = {
  before: "/media/ba/before.jpg",
  after: "/media/ba/after.jpg",
  captionAz: "",
  captionEn: "",
  tiktokUrl: "",
  sortOrder: 0,
};

export default function AdminBeforeAfterPage() {
  const { items, loading, error, reload } = useAdminList<Item>("/api/admin/before-after");
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function startEdit(item: Item) {
    setEditId(item.id);
    setForm({
      before: item.before,
      after: item.after,
      captionAz: item.captionAz,
      captionEn: item.captionEn,
      tiktokUrl: item.tiktokUrl || "",
      sortOrder: item.sortOrder,
    });
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
      const payload = { ...form, tiktokUrl: form.tiktokUrl || null };
      if (editId) {
        await apiJson(`/api/admin/before-after/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMsg("Yeniləndi");
      } else {
        await apiJson("/api/admin/before-after", {
          method: "POST",
          body: JSON.stringify(payload),
        });
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
    await apiJson(`/api/admin/before-after/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Before / After</h1>
          <p className="admin-sub">Müqayisə şəkilləri</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <form className="admin-form two" onSubmit={onSubmit}>
          <ImageUpload label="Before" value={form.before} onChange={(before) => setForm({ ...form, before })} />
          <ImageUpload label="After" value={form.after} onChange={(after) => setForm({ ...form, after })} />
          <Field label="Caption AZ">
            <input
              value={form.captionAz}
              onChange={(e) => setForm({ ...form, captionAz: e.target.value })}
              required
            />
          </Field>
          <Field label="Caption EN">
            <input
              value={form.captionEn}
              onChange={(e) => setForm({ ...form, captionEn: e.target.value })}
              required
            />
          </Field>
          <Field label="TikTok URL" full>
            <input
              value={form.tiktokUrl || ""}
              onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
            />
          </Field>
          <Field label="Sıra">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
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
              <th>Before</th>
              <th>After</th>
              <th>Caption</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="admin-thumb" src={item.before} alt="" />
                </td>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="admin-thumb" src={item.after} alt="" />
                </td>
                <td>{item.captionAz}</td>
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
