"use client";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, Edit3, Trash2 } from "lucide-react";
import { likeStory, addComment, unlikeStory } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Story = {
  id: string;
  userID: string;
  content: string;
  imageURL: string;
  storagePath?: string;
  likesCount: number;
  commentsCount: number;
};

export default function StoryCard({ story }: { story: Story }) {
  const [likes, setLikes] = useState(story.likesCount);
  const [commentText, setCommentText] = useState("");
  const [commentsCount, setCommentsCount] = useState(story.commentsCount);
  const [liked, setLiked] = useState(false);
  const [author, setAuthor] = useState<{ displayName?: string; profileImage?: string } | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState<any>(null);

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
    const unsub = onSnapshot(q, (snap) => {
      setCommentsCount(snap.size);
      setComments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
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
  useEffect(() => {
    const q = query(collection(db, "profiles"), where("userID", "==", story.userID));
    const unsub = onSnapshot(q, (snap) => {
      const d = snap.docs[0]?.data() as any;
      setAuthor(d ?? null);
    });
    return () => unsub();
  }, [story.userID]);

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
  const onShare = async () => {
    const url = `${location.origin}/feed#${story.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ url, text: story.content });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      }
    } catch {}
  };
  const onEdit = async () => {
    const u = auth.currentUser;
    if (!u || u.uid !== story.userID) return;
    const next = prompt("Edit story text:", story.content)?.trim();
    if (!next) return;
    const { doc, updateDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    await updateDoc(doc(db, "stories", story.id), { content: next });
  };
  const onDelete = async () => {
    const u = auth.currentUser;
    if (!u || u.uid !== story.userID) return;
    if (!confirm("Delete this story? You can undo for 5 seconds.")) return;
    setPendingDelete(true);
    const timer = setTimeout(async () => {
      // Permanently delete Firestore doc and Storage file
      const { doc, deleteDoc } = await import("firebase/firestore");
      const { db, storage } = await import("@/lib/firebase");
      const { ref, deleteObject } = await import("firebase/storage");
      try {
        await deleteDoc(doc(db, "stories", story.id));
      } catch {}
      try {
        const fileRef = ref(storage, story.storagePath || "");
        if (story.storagePath) {
          await deleteObject(fileRef);
        }
      } catch {}
      setPendingDelete(false);
    }, 5000);
    setDeleteTimer(timer);
  };
  const undoDelete = () => {
    if (deleteTimer) {
      clearTimeout(deleteTimer);
      setDeleteTimer(null);
      setPendingDelete(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden glass hover-card" id={story.id}>
      {story.imageURL ? (
        <img src={story.imageURL} alt="story" className="w-full aspect-square object-cover" />
      ) : (
        <div className="w-full aspect-square bg-white/5" />
      )}
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
          <button onClick={onShare} className="flex items-center gap-1 opacity-80 hover:opacity-100"><Share2 size={16}/> Share</button>
          {auth.currentUser?.uid === story.userID && (
            <>
              <button onClick={onEdit} className="flex items-center gap-1 opacity-80 hover:opacity-100"><Edit3 size={16}/> Edit</button>
              {!pendingDelete ? (
                <button onClick={onDelete} className="flex items-center gap-1 opacity-80 hover:opacity-100 text-red-400"><Trash2 size={16}/> Delete</button>
              ) : (
                <button onClick={undoDelete} className="flex items-center gap-1 opacity-100 text-emerald-400">Undo delete</button>
              )}
            </>
          )}
        </div>
        {comments.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {comments.map((c) => (
              <div key={c.id} className="text-xs opacity-80">
                <span className="opacity-60">{c.userID.slice(0,6)}:</span> {c.text}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment" className="flex-1 px-3 py-2 rounded-full bg-white/5 border border-white/10" />
          <button onClick={onComment} className="px-4 py-2 rounded-full btn-outline">Post</button>
        </div>
      </div>
    </div>
  );
}


