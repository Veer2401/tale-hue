"use client";
import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { likeStory, addComment, unlikeStory } from "@/src/lib/firestore";
import { auth } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Story = {
  id: string;
  userID: string;
  content: string;
  imageURL: string;
  likesCount: number;
  commentsCount: number;
};

export default function StoryCard({ story }: { story: Story }) {
  const [likes, setLikes] = useState(story.likesCount);
  const [commentText, setCommentText] = useState("");
  const [commentsCount, setCommentsCount] = useState(story.commentsCount);
  const [liked, setLiked] = useState(false);
  // Initialize liked from localStorage cache quickly to avoid flicker
  useEffect(() => {
    const u = auth.currentUser;
    if (typeof window === "undefined" || !u) return;
    const key = `liked:${u.uid}:${story.id}`;
    const cached = window.localStorage.getItem(key);
    if (cached === "1") setLiked(true);
    if (cached === "0") setLiked(false);
  }, [story.id]);
  useEffect(() => {
    const q = query(collection(db, "likes"), where("storyID", "==", story.id));
    const unsub = onSnapshot(q, (snap) => setLikes(snap.size));
    return () => unsub();
  }, [story.id]);
  useEffect(() => {
    const q = query(collection(db, "comments"), where("storyID", "==", story.id));
    const unsub = onSnapshot(q, (snap) => setCommentsCount(snap.size));
    return () => unsub();
  }, [story.id]);
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const q = query(collection(db, "likes"), where("storyID", "==", story.id), where("userID", "==", u.uid));
    const unsub = onSnapshot(q, (snap) => {
      const isLiked = !snap.empty;
      setLiked(isLiked);
      if (typeof window !== "undefined") {
        const key = `liked:${u.uid}:${story.id}`;
        window.localStorage.setItem(key, isLiked ? "1" : "0");
      }
    });
    return () => unsub();
  }, [story.id, auth.currentUser?.uid]);
  const onLike = async () => {
    const u = auth.currentUser;
    if (!u) return;
    if (liked) {
      setLiked(false);
      setLikes((v) => Math.max(0, v - 1));
      await unlikeStory(story.id, u.uid);
      if (typeof window !== "undefined") window.localStorage.setItem(`liked:${u.uid}:${story.id}`, "0");
    } else {
      setLiked(true);
      setLikes((v) => v + 1);
      await likeStory(story.id, u.uid);
      if (typeof window !== "undefined") window.localStorage.setItem(`liked:${u.uid}:${story.id}`, "1");
    }
  };
  const onComment = async () => {
    const u = auth.currentUser;
    if (!u || !commentText.trim()) return;
    await addComment(story.id, u.uid, commentText.trim());
    setCommentText("");
  };
  const [author, setAuthor] = useState<{ displayName?: string; profileImage?: string } | null>(null);
  useEffect(() => {
    const q = query(collection(db, "profiles"), where("userID", "==", story.userID));
    const unsub = onSnapshot(q, (snap) => {
      const d = snap.docs[0]?.data() as any;
      setAuthor(d ?? null);
    });
    return () => unsub();
  }, [story.userID]);

  return (
    <div className="rounded-2xl overflow-hidden glass hover-card">
      <img src={story.imageURL} alt="story" className="w-full aspect-square object-cover" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {author?.profileImage ? (
            <img src={author.profileImage} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10" />
          )}
          <div className="text-sm opacity-80">{author?.displayName || "Anon"}</div>
        </div>
        <div className="text-sm opacity-80">{story.content}</div>
        <div className="flex items-center gap-4 text-sm">
          <button onClick={onLike} className={`flex items-center gap-1 hover:opacity-80 ${liked ? "text-[var(--neon)]" : ""}`}>
            <Heart size={16} className={liked ? "fill-current" : ""}/>
            {likes}
          </button>
          <div className="flex items-center gap-1 opacity-70"><MessageCircle size={16}/> {commentsCount}</div>
        </div>
        <div className="flex gap-2">
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment" className="flex-1 px-3 py-2 rounded-full bg-white/5 border border-white/10" />
          <button onClick={onComment} className="px-4 py-2 rounded-full btn-outline">Post</button>
        </div>
      </div>
    </div>
  );
}


