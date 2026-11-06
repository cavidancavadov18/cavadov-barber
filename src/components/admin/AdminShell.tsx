"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/services", label: "Xidmətlər" },
  { href: "/admin/barbers", label: "Ustalar" },
  { href: "/admin/bookings", label: "Rezervasiyalar" },
  { href: "/admin/gallery", label: "Qalereya" },
  { href: "/admin/reviews", label: "Rəylər" },
  { href: "/admin/tiktok", label: "TikTok" },
  { href: "/admin/before-after", label: "Before / After" },
  { href: "/admin/works", label: "Polad İşlər" },
  { href: "/admin/settings", label: "Ayarlar" },
];

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <aside className="admin-side">
          <div className="admin-brand">CAVADOV ADMIN</div>
          <nav className="admin-nav">
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} className={active ? "active" : ""}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div style={{ padding: "0.5rem 0.65rem", color: "var(--a-muted)", fontSize: "0.85rem" }}>
            {username}
          </div>
          <button type="button" className="admin-btn" onClick={logout}>
            Çıxış
          </button>
          <Link href="/az" className="admin-btn" style={{ textAlign: "center" }}>
            Sayta bax
          </Link>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
