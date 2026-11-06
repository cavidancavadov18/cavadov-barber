"use client";

import { FormEvent, useState } from "react";
import { Field, apiJson, useAdminList } from "@/components/admin/CrudHelpers";

type Item = {
  id: string;
  nameAz: string;
  nameEn: string;
  textAz: string;
  textEn: string;
  rating: number;
  sortOrder: number;
};

const empty: Omit<Item, "id"> = {
  nameAz: "",
  nameEn: "",
  textAz: "",
  textEn: "",
  rating: 5,
  sortOrder: 0,
};

export default function AdminReviewsPage() {
  const { items, loading, error, reload } = useAdminList<Item>("/api/admin/reviews");
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
        await apiJson(`/api/admin/reviews/${editId}`, { method: "PUT", body: JSON.stringify(form) });
        setMsg("Yeniləndi");
      } else {
        await apiJson("/api/admin/reviews", { method: "POST", body: JSON.stringify(form) });
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
    await apiJson(`/api/admin/reviews/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Rəylər</h1>
          <p className="admin-sub">Müştəri rəyləri</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <form className="admin-form two" onSubmit={onSubmit}>
          <Field label="Ad AZ">
            <input value={form.nameAz} onChange={(e) => setForm({ ...form, nameAz: e.target.value })} required />
          </Field>
          <Field label="Ad EN">
            <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
          </Field>
          <Field label="Reytinq">
            <input
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            />
          </Field>
          <Field label="Sıra">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
          <Field label="Mətn AZ" full>
            <textarea value={form.textAz} onChange={(e) => setForm({ ...form, textAz: e.target.value })} required />
          </Field>
          <Field label="Mətn EN" full>
            <textarea value={form.textEn} onChange={(e) => setForm({ ...form, textEn: e.target.value })} required />
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
              <th>Ad</th>
              <th>Mətn</th>
              <th>★</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.nameAz}</td>
                <td>{item.textAz}</td>
                <td>{item.rating}</td>
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
