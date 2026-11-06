"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/components/admin/CrudHelpers";

type Stats = {
  counts: {
    services: number;
    barbers: number;
    bookings: number;
    gallery: number;
    reviews: number;
    tiktok: number;
    confirmed: number;
    cancelled: number;
  };
  recent: Array<{
    id: string;
    customerName: string;
    phone: string;
    date: string;
    time: string;
    status: string;
    service: { nameAz: string };
    barber: { nameAz: string };
  }>;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiJson<Stats>("/api/admin/stats")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Xəta"));
  }, []);

  return (
    <>
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-sub">Bütün sayt məlumatları buradan idarə olunur</p>
        </div>
        <Link className="admin-btn primary" href="/admin/bookings">
          Rezervasiyalar
        </Link>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      {data ? (
        <>
          <div className="admin-grid">
            {[
              ["Xidmətlər", data.counts.services],
              ["Ustalar", data.counts.barbers],
              ["Rezervasiya", data.counts.bookings],
              ["Təsdiqli", data.counts.confirmed],
              ["Qalereya", data.counts.gallery],
              ["Rəylər", data.counts.reviews],
              ["TikTok", data.counts.tiktok],
              ["Ləğv", data.counts.cancelled],
            ].map(([label, value]) => (
              <div className="admin-card" key={String(label)}>
                <div className="label">{label}</div>
                <div className="value">{value}</div>
              </div>
            ))}
          </div>

          <div className="admin-card" style={{ marginTop: "1.25rem" }}>
            <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Son rezervasiyalar</h2>
            <div className="admin-table-wrap" style={{ border: "none" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Müştəri</th>
                    <th>Xidmət</th>
                    <th>Usta</th>
                    <th>Tarix</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.length === 0 ? (
                    <tr>
                      <td colSpan={5}>Hələ rezervasiya yoxdur</td>
                    </tr>
                  ) : (
                    data.recent.map((b) => (
                      <tr key={b.id}>
                        <td>
                          {b.customerName}
                          <div style={{ color: "var(--a-muted)", fontSize: "0.8rem" }}>{b.phone}</div>
                        </td>
                        <td>{b.service.nameAz}</td>
                        <td>{b.barber.nameAz}</td>
                        <td>
                          {b.date} {b.time}
                        </td>
                        <td>
                          <span className={`admin-badge ${b.status === "cancelled" ? "warn" : "ok"}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : !error ? (
        <p className="admin-sub">Yüklənir...</p>
      ) : null}
    </>
  );
}
