"use client";

import { FormEvent, useState } from "react";
import { Field, apiJson, useAdminList } from "@/components/admin/CrudHelpers";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Item = {
  id: string;
  kind: string;
  src: string;
  alt: string;
  labelAz: string;
  labelEn: string;
  sortOrder: number;
};

const empty: Omit<Item, "id"> = {
  kind: "tile",
  src: "/media/unique/tt-02.jpg",
  alt: "",
  labelAz: "",
  labelEn: "",
  sortOrder: 0,
};

export default function AdminWorksPage() {
  const { items, loading, error, reload } = useAdminList<Item>("/api/admin/works");
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
        await apiJson(`/api/admin/works/${editId}`, { method: "PUT", body: JSON.stringify(form) });
        setMsg("Yeniləndi");
      } else {
        await apiJson("/api/admin/works", { method: "POST", body: JSON.stringify(form) });
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
    await apiJson(`/api/admin/works/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Polad İşlər</h1>
          <p className="admin-sub">Banner və kəsim kartları</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <form className="admin-form two" onSubmit={onSubmit}>
          <Field label="Növ">
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="banner">banner</option>
              <option value="tile">tile</option>
            </select>
          </Field>
          <Field label="Sıra">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
          <ImageUpload value={form.src} onChange={(src) => setForm({ ...form, src })} />
          <Field label="Alt">
            <input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} required />
          </Field>
          <Field label="Label AZ">
            <input value={form.labelAz} onChange={(e) => setForm({ ...form, labelAz: e.target.value })} required />
          </Field>
          <Field label="Label EN">
            <input value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} required />
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
              <th>Növ</th>
              <th>Label</th>
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
                <td>{item.kind}</td>
                <td>{item.labelAz}</td>
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
