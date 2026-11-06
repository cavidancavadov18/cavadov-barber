"use client";

import { FormEvent, useState } from "react";
import { Field, apiJson, useAdminList } from "@/components/admin/CrudHelpers";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Service = {
  id: string;
  slug: string;
  nameAz: string;
  nameEn: string;
  descriptionAz: string;
  descriptionEn: string;
  price: number;
  priceNoteAz: string | null;
  priceNoteEn: string | null;
  durationMin: number;
  image: string;
  sortOrder: number;
};

const empty: Omit<Service, "id"> = {
  slug: "",
  nameAz: "",
  nameEn: "",
  descriptionAz: "",
  descriptionEn: "",
  price: 0,
  priceNoteAz: "",
  priceNoteEn: "",
  durationMin: 30,
  image: "/media/cuts/cut-03.jpg",
  sortOrder: 0,
};

export default function AdminServicesPage() {
  const { items, loading, error, reload } = useAdminList<Service>("/api/admin/services");
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function startEdit(item: Service) {
    setEditId(item.id);
    setForm({
      slug: item.slug,
      nameAz: item.nameAz,
      nameEn: item.nameEn,
      descriptionAz: item.descriptionAz,
      descriptionEn: item.descriptionEn,
      price: item.price,
      priceNoteAz: item.priceNoteAz || "",
      priceNoteEn: item.priceNoteEn || "",
      durationMin: item.durationMin,
      image: item.image,
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
      const payload = {
        ...form,
        priceNoteAz: form.priceNoteAz || null,
        priceNoteEn: form.priceNoteEn || null,
      };
      if (editId) {
        await apiJson(`/api/admin/services/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMsg("Yeniləndi");
      } else {
        await apiJson("/api/admin/services", {
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
    await apiJson(`/api/admin/services/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Xidmətlər</h1>
          <p className="admin-sub">Qiymət menyusu</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <form className="admin-form two" onSubmit={onSubmit}>
          <Field label="Slug">
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </Field>
          <Field label="Sıra">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
          <Field label="Ad AZ">
            <input value={form.nameAz} onChange={(e) => setForm({ ...form, nameAz: e.target.value })} required />
          </Field>
          <Field label="Ad EN">
            <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
          </Field>
          <Field label="Qiymət">
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
          </Field>
          <Field label="Müddət (dəq)">
            <input
              type="number"
              value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
              required
            />
          </Field>
          <Field label="Qiymət qeydi AZ">
            <input
              value={form.priceNoteAz || ""}
              onChange={(e) => setForm({ ...form, priceNoteAz: e.target.value })}
            />
          </Field>
          <Field label="Qiymət qeydi EN">
            <input
              value={form.priceNoteEn || ""}
              onChange={(e) => setForm({ ...form, priceNoteEn: e.target.value })}
            />
          </Field>
          <ImageUpload label="Şəkil" value={form.image} onChange={(image) => setForm({ ...form, image })} />
          <Field label="Təsvir AZ" full>
            <textarea
              value={form.descriptionAz}
              onChange={(e) => setForm({ ...form, descriptionAz: e.target.value })}
              required
            />
          </Field>
          <Field label="Təsvir EN" full>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              required
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
            {msg ? <span className={msg.includes("Xəta") || msg.includes("failed") ? "admin-error" : "admin-ok"}>{msg}</span> : null}
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
              <th>Qiymət</th>
              <th>Sıra</th>
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
                <td>
                  <strong>{item.nameAz}</strong>
                  <div style={{ color: "var(--a-muted)", fontSize: "0.8rem" }}>{item.slug}</div>
                </td>
                <td>
                  {item.priceNoteAz || `${item.price} AZN`}
                  <div style={{ color: "var(--a-muted)", fontSize: "0.8rem" }}>{item.durationMin} dəq</div>
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
