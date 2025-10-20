"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import StoryCard, { Story } from "@/components/StoryCard";

export default function FeedPage() {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => {
    const qy = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qy, (snap) => {
      setStories(
        snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          const getStr = (k: string) => (typeof data[k] === "string" ? String(data[k]) : "");
          const getNum = (k: string) => (typeof data[k] === "number" ? Number(data[k]) : 0);
          const s: Story = {
            id: d.id,
            userID: getStr("userID"),
            content: getStr("content"),
            imageURL: getStr("imageURL"),
            storagePath: getStr("storagePath") || undefined,
            likesCount: getNum("likesCount"),
            commentsCount: getNum("commentsCount"),
          };
          return s;
        })
      );
    });
    return () => unsub();
  }, []);
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {stories.map((s) => (
        <StoryCard key={s.id} story={s} />
      ))}
    </div>
  );
}


