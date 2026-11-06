"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-shell admin-login">
      <div className="admin-login-card">
        <h1 className="admin-title">Admin</h1>
        <p className="admin-sub">CAVADOV BARBER idarə paneli</p>
        <form className="admin-form" style={{ marginTop: "1.25rem" }} onSubmit={onSubmit}>
          <div className="admin-field">
            <label>İstifadəçi</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div className="admin-field">
            <label>Şifrə</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="admin-error">{error}</p> : null}
          <button className="admin-btn primary" type="submit" disabled={loading}>
            {loading ? "Giriş..." : "Daxil ol"}
          </button>
        </form>
      </div>
    </div>
  );
}
