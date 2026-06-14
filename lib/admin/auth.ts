import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Server-side admin guard — defence-in-depth beyond the proxy gate (proxy.ts). Every
// admin page and Server Action calls this first so a missing/expired/non-admin session
// can never reach the data layer, even if the proxy matcher ever changes.
export async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") {
    redirect("/admin/login");
  }
  return session;
}
