"use client";

import { useEffect, useState } from "react";

// Renders its children only for a visitor who currently holds a valid admin
// session. `/api/admin/me` is gated by the admin auth middleware: a 200 means
// authenticated, anonymous visitors get a fast 401 (no Supabase round-trip and
// nothing admin-related is ever sent to them).
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => {
        if (active) setIsAdmin(r.ok);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return isAdmin;
}

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  return <>{children}</>;
}
