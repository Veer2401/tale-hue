"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, doc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { followUser, unfollowUser } from "@/lib/firestore";

type Profile = {
  id: string;
  userID?: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
};

export default function SearchPage() {
  const [qText, setQText] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const run = async () => {
    if (!qText.trim()) return setResults([]);
    const qy = query(collection(db, "profiles"), where("displayName", ">=", qText), where("displayName", "<=", qText + "\uf8ff"), limit(10));
    const snap = await getDocs(qy);
    setResults(snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      const getStr = (k: string) => (typeof data[k] === "string" ? String(data[k]) : undefined);
      return {
        id: d.id,
        displayName: getStr("displayName"),
        bio: getStr("bio"),
        profileImage: getStr("profileImage"),
      } as Profile;
    }));
  };
  useEffect(() => {
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [qText]);
  return (
    <div className="max-w-xl mx-auto">
      <input className="w-full px-3 py-2 rounded-full bg-white/5 border border-white/10" placeholder="Search profiles" value={qText} onChange={(e) => setQText(e.target.value)} />
      <div className="mt-4 flex flex-col gap-2">
        {results.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl glass hover-card">
            {p.profileImage ? <img src={p.profileImage} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-white/10" />}
            <div>
              <div className="text-sm font-medium">{p.displayName || "Unnamed"}</div>
              <div className="text-xs opacity-60">{p.bio}</div>
            </div>
            <div className="flex-1" />
            <FollowButton targetId={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowButton({ targetId }: { targetId: string }) {
  const u = auth.currentUser;
  const [following, setFollowing] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    (async () => {
      if (!u) return setFollowing(false);
      const snap = await getDoc(doc(db, "profiles", u.uid));
      const data = snap.data() as Record<string, unknown> | undefined;
      if (!data) return setFollowing(false);
      const following = Array.isArray(data.following) ? (data.following as unknown[]) : [];
      setFollowing(following.includes(targetId));
    })();
  }, [u?.uid, targetId]);
  if (!u) return null;
  const toggle = async () => {
    if (following) {
      await unfollowUser(u.uid, targetId);
      setFollowing(false);
    } else {
      await followUser(u.uid, targetId);
      setFollowing(true);
    }
  };
  return (
    <button onClick={toggle} className={`px-3 py-1.5 rounded-full ${following ? "btn-outline" : "btn-primary"}`}>
      {following ? "Following" : "Follow"}
    </button>
  );
}


