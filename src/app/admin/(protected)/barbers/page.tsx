"use client";

import { FormEvent, useState } from "react";
import { Field, apiJson, useAdminList } from "@/components/admin/CrudHelpers";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Barber = {
  id: string;
  slug: string;
  nameAz: string;
  nameEn: string;
  roleAz: string;
  roleEn: string;
  bioAz: string;
  bioEn: string;
  image: string;
  experience: number;
};

const empty: Omit<Barber, "id"> = {
  slug: "",
  nameAz: "",
  nameEn: "",
  roleAz: "",
  roleEn: "",
  bioAz: "",
  bioEn: "",
  image: "/media/hero-barber.jpg",
  experience: 1,
};

export default function AdminBarbersPage() {
  const { items, loading, error, reload } = useAdminList<Barber>("/api/admin/barbers");
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function startEdit(item: Barber) {
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
        await apiJson(`/api/admin/barbers/${editId}`, { method: "PUT", body: JSON.stringify(form) });
        setMsg("Yeniləndi");
      } else {
        await apiJson("/api/admin/barbers", { method: "POST", body: JSON.stringify(form) });
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
    await apiJson(`/api/admin/barbers/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Ustalar</h1>
          <p className="admin-sub">Barber profiləri</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <form className="admin-form two" onSubmit={onSubmit}>
          <Field label="Slug">
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </Field>
          <Field label="Təcrübə (il)">
            <input
              type="number"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
            />
          </Field>
          <Field label="Ad AZ">
            <input value={form.nameAz} onChange={(e) => setForm({ ...form, nameAz: e.target.value })} required />
          </Field>
          <Field label="Ad EN">
            <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
          </Field>
          <Field label="Rol AZ">
            <input value={form.roleAz} onChange={(e) => setForm({ ...form, roleAz: e.target.value })} required />
          </Field>
          <Field label="Rol EN">
            <input value={form.roleEn} onChange={(e) => setForm({ ...form, roleEn: e.target.value })} required />
          </Field>
          <ImageUpload label="Şəkil" value={form.image} onChange={(image) => setForm({ ...form, image })} />
          <Field label="Bio AZ" full>
            <textarea value={form.bioAz} onChange={(e) => setForm({ ...form, bioAz: e.target.value })} required />
          </Field>
          <Field label="Bio EN" full>
            <textarea value={form.bioEn} onChange={(e) => setForm({ ...form, bioEn: e.target.value })} required />
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
              <th>Ad</th>
              <th>Rol</th>
              <th>İl</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="admin-thumb" src={item.image} alt="" />
                </td>
                <td>{item.nameAz}</td>
                <td>{item.roleAz}</td>
                <td>{item.experience}</td>
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
