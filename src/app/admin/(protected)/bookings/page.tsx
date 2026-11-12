"use client";

import { FormEvent, useEffect, useState } from "react";
import { Field, apiJson, useAdminList } from "@/components/admin/CrudHelpers";

type Booking = {
  id: string;
  barberId: string;
  serviceId: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  locale: string;
  notes: string | null;
  status: string;
  service: { id: string; nameAz: string; price: number };
  barber: { id: string; nameAz: string };
};

type Option = { id: string; nameAz: string };

const empty = {
  barberId: "",
  serviceId: "",
  customerName: "",
  phone: "",
  date: "",
  time: "10:00",
  locale: "az",
  notes: "",
  status: "pending",
};

export default function AdminBookingsPage() {
  const { items, loading, error, reload } = useAdminList<Booking>("/api/admin/bookings");
  const [services, setServices] = useState<Option[]>([]);
  const [barbers, setBarbers] = useState<Option[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      apiJson<Option[]>("/api/admin/services"),
      apiJson<Option[]>("/api/admin/barbers"),
    ]).then(([s, b]) => {
      setServices(s);
      setBarbers(b);
      setForm((f) => ({
        ...f,
        serviceId: f.serviceId || s[0]?.id || "",
        barberId: f.barberId || b[0]?.id || "",
      }));
    });
  }, []);

  function startEdit(item: Booking) {
    setEditId(item.id);
    setForm({
      barberId: item.barberId,
      serviceId: item.serviceId,
      customerName: item.customerName,
      phone: item.phone,
      date: item.date,
      time: item.time,
      locale: item.locale,
      notes: item.notes || "",
      status: item.status,
    });
  }

  function reset() {
    setEditId(null);
    setForm({
      ...empty,
      serviceId: services[0]?.id || "",
      barberId: barbers[0]?.id || "",
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const payload = { ...form, notes: form.notes || null };
      if (editId) {
        await apiJson(`/api/admin/bookings/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMsg("Yeniləndi");
      } else {
        await apiJson("/api/admin/bookings", {
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
    await apiJson(`/api/admin/bookings/${id}`, { method: "DELETE" });
    await reload();
  }

  async function setStatus(id: string, status: string) {
    setBusy(true);
    setMsg("");
    try {
      await apiJson(`/api/admin/bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setMsg(status === "confirmed" ? "Təsdiqləndi" : "Status yeniləndi");
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Xəta");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Rezervasiyalar</h1>
          <p className="admin-sub">Bütün booking-lər</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <form className="admin-form two" onSubmit={onSubmit}>
          <Field label="Müştəri">
            <input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required
            />
          </Field>
          <Field label="Telefon">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </Field>
          <Field label="Xidmət">
            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              required
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAz}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Usta">
            <select
              value={form.barberId}
              onChange={(e) => setForm({ ...form, barberId: e.target.value })}
              required
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nameAz}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tarix">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </Field>
          <Field label="Saat">
            <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">pending (gözləmə)</option>
              <option value="confirmed">confirmed (təsdiq)</option>
              <option value="completed">completed (bitib)</option>
              <option value="cancelled">cancelled (ləğv)</option>
            </select>
          </Field>
          <Field label="Dil">
            <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })}>
              <option value="az">az</option>
              <option value="en">en</option>
            </select>
          </Field>
          <Field label="Qeyd" full>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
              <th>Müştəri</th>
              <th>Xidmət / Usta</th>
              <th>Vaxt</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.customerName}
                  <div style={{ color: "var(--a-muted)", fontSize: "0.8rem" }}>{item.phone}</div>
                </td>
                <td>
                  {item.service.nameAz}
                  <div style={{ color: "var(--a-muted)", fontSize: "0.8rem" }}>{item.barber.nameAz}</div>
                </td>
                <td>
                  {item.date} {item.time}
                </td>
                <td>
                  <span
                    className={`admin-badge ${
                      item.status === "cancelled"
                        ? "warn"
                        : item.status === "pending"
                          ? "warn"
                          : "ok"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    {item.status === "pending" ? (
                      <button
                        type="button"
                        className="admin-btn primary"
                        disabled={busy}
                        onClick={() => setStatus(item.id, "confirmed")}
                      >
                        Təsdiqlə
                      </button>
                    ) : null}
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
