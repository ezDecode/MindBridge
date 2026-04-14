"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/dashboard?tab=mind&open=questions");
  }, [router]);

  return null;
}
