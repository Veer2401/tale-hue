"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import StoryCard from "@/components/StoryCard";

export default function FeedPage() {
  const [stories, setStories] = useState<any[]>([]);
  useEffect(() => {
    const qy = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qy, (snap) => {
      setStories(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {stories.map((s) => (
        <StoryCard key={s.id} story={s as any} />
      ))}
    </div>
  );
}


