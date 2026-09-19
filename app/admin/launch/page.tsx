"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Former launch preview route — idea pool is display-only on Sites. */
export default function AdminLaunchRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/sites#idea-pool");
  }, [router]);
  return (
    <p className="px-4 py-8 text-sm text-muted">
      Redirecting to Sites · Idea pool…
    </p>
  );
}
