"use client";
import { ReactNode, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { ensureUserAndProfile } from "@/lib/firestore";

export default function AuthGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await ensureUserAndProfile(u);
      }
    });
    return () => unsub();
  }, []);

  if (user === undefined) return <div className="p-6 text-sm opacity-70">Loading…</div>;
  if (!user) return <>{fallback ?? null}</>;
  return <>{children}</>;
}


