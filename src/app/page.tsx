"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ROLE_REDIRECT: Record<string, string> = {
  KURIR:    "/driver/pesanan/masuk",
  PENGGUNA: "/user/beranda",
  ADMIN:    "/admin",
};

function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const role = getRoleFromToken(token);
    router.replace(ROLE_REDIRECT[role ?? ""] ?? "/auth/login");
  }, [router]);

  return null;
}
