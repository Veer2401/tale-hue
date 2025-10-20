"use client";
import { useEffect, useState } from "react";
import { auth, storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { followUser, unfollowUser } from "@/lib/firestore";

export default function ProfilePage() {
  const u = auth.currentUser;
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!u) return;
    (async () => {
      const snap = await getDoc(doc(db, "profiles", u.uid));
      const data = snap.data() as Record<string, unknown> | undefined;
      if (data) {
        setDisplayName(typeof data.displayName === 'string' ? data.displayName : "");
        setBio(typeof data.bio === 'string' ? data.bio : "");
        setImage(typeof data.profileImage === 'string' ? data.profileImage : "");
      }
    })();
  }, [u?.uid]);

  const onFile = async (f: File) => {
    if (!u) return;
    setLoading(true);
    try {
      const r = ref(storage, `profileImages/${u.uid}/${f.name}`);
      await uploadBytes(r, f);
      const url = await getDownloadURL(r);
      setImage(url);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!u) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "profiles", u.uid), { displayName, bio, profileImage: image });
    } finally {
      setLoading(false);
    }
  };

  if (!u) return <div className="opacity-70">Sign in to edit profile.</div>;
  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {image ? (
          <img src={image} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/10" />
        )}
        <label className="px-3 py-1.5 rounded-full btn-outline cursor-pointer">
          Upload
          <input className="hidden" type="file" accept="image/*" onChange={(e) => e.target.files && onFile(e.target.files[0])} />
        </label>
      </div>
      <input className="px-3 py-2 rounded-lg bg-white/5 border border-white/10" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      <textarea className="px-3 py-2 rounded-lg bg-white/5 border border-white/10" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      <div className="flex gap-2">
        <button disabled={loading} onClick={save} className="px-4 py-2 rounded-full btn-primary disabled:opacity-40">Save</button>
        {/* Example follow self-disabled; in real profile view, show other user's id */}
        <button disabled className="px-4 py-2 rounded-full btn-outline opacity-50">Follow</button>
      </div>
    </div>
  );
}


