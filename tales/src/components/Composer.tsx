"use client";
import { useState } from "react";
import { auth, storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Composer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const generate = async () => {
    if (!text.trim() || text.length > 150) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-image", { method: "POST", body: JSON.stringify({ prompt: text }), headers: { "Content-Type": "application/json" } });
      if (!res.ok) {
        // Try to parse JSON error for debugging in console, but don't surface to user
        try { console.debug("gen error", await res.json()); } catch {}
        throw new Error("gen error");
      }
      const ct = res.headers.get("Content-Type") || "image/png";
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreview(url);
      (setPreview as any)._contentType = ct;
    } finally {
      setLoading(false);
    }
  };

  const post = async () => {
    const user = auth.currentUser;
    if (!user || !preview) return;
    setLoading(true);
    try {
      const blob = await fetch(preview).then((r) => r.blob());
      const ct = (setPreview as any)._contentType || blob.type || "image/png";
      const ext = ct.includes("svg") ? "svg" : ct.includes("jpeg") ? "jpg" : ct.includes("png") ? "png" : "png";
      const fileRef = ref(storage, `stories/${user.uid}/${Date.now()}.${ext}`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      const storagePath = fileRef.fullPath;
      await addDoc(collection(db, "stories"), {
        userID: user.uid,
        content: text.trim(),
        imageURL: url,
        storagePath,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      setText("");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl p-4 glass hover-card">
      <textarea
        className="w-full bg-transparent outline-none resize-none text-base placeholder-white/40"
        placeholder="Write a micro-story (≤150 chars)"
        value={text}
        maxLength={150}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm opacity-60">{text.length}/150</div>
        <div className="flex gap-2">
          <button disabled={loading || !text} onClick={generate} className="px-4 py-2 rounded-full btn-outline disabled:opacity-40">Generate Image</button>
          <button disabled={loading || !preview} onClick={post} className="px-4 py-2 rounded-full btn-primary disabled:opacity-40">Post</button>
        </div>
      </div>
      {preview && (
        <div className="mt-4">
          <img alt="preview" src={preview} className="w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}


