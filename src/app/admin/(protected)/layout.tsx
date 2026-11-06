import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const username = await requireAdmin();
  if (!username) redirect("/admin/login");
  return <AdminShell username={username}>{children}</AdminShell>;
}
