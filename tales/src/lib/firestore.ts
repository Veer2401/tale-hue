import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
} from "firebase/firestore";

export type UserDoc = {
  uid: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: any;
};

export type ProfileDoc = {
  userID: string;
  displayName: string;
  bio: string;
  profileImage: string;
  followers: string[];
  following: string[];
  stories: string[];
};

export async function ensureUserAndProfile(u: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
}) {
  const userRef = doc(db, "users", u.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const userDoc: Partial<UserDoc> = {
      uid: u.uid,
      name: u.displayName ?? "",
      createdAt: serverTimestamp(),
      ...(u.email ? { email: u.email } : {}),
      ...(u.phoneNumber ? { phoneNumber: u.phoneNumber } : {}),
      ...(u.photoURL ? { photoURL: u.photoURL } : {}),
    };
    await setDoc(userRef, userDoc as any, { merge: true });
  }

  const profileRef = doc(db, "profiles", u.uid);
  const profileSnap = await getDoc(profileRef);
  if (!profileSnap.exists()) {
    const profileDoc: ProfileDoc = {
      userID: u.uid,
      displayName: u.displayName ?? "",
      bio: "",
      profileImage: "",
      followers: [],
      following: [],
      stories: [],
    };
    await setDoc(profileRef, profileDoc, { merge: true });
  }
}

export async function addStoryIdToProfile(userID: string, storyID: string) {
  const profileRef = doc(db, "profiles", userID);
  await updateDoc(profileRef, { stories: arrayUnion(storyID) });
}

export async function likeStory(storyID: string, userID: string) {
  const likesRef = collection(db, "likes");
  await addDoc(likesRef, { storyID, userID, createdAt: serverTimestamp() });
  const storyRef = doc(db, "stories", storyID);
  await updateDoc(storyRef, { likesCount: increment(1) });
}

export async function unlikeStory(storyID: string, userID: string) {
  // Find like doc
  const likesRef = collection(db, "likes");
  const q = query(likesRef, where("storyID", "==", storyID), where("userID", "==", userID), limit(1));
  const snap = await getDocs(q);
  const likeDoc = snap.docs[0];
  if (likeDoc) {
    await deleteDoc(likeDoc.ref);
    const storyRef = doc(db, "stories", storyID);
    await updateDoc(storyRef, { likesCount: increment(-1) });
  }
}

export async function addComment(storyID: string, userID: string, text: string) {
  await addDoc(collection(db, "comments"), { storyID, userID, text, createdAt: serverTimestamp() });
  const storyRef = doc(db, "stories", storyID);
  await updateDoc(storyRef, { commentsCount: increment(1) });
}

export async function followUser(currentUserID: string, targetUserID: string) {
  const meRef = doc(db, "profiles", currentUserID);
  const themRef = doc(db, "profiles", targetUserID);
  await updateDoc(meRef, { following: arrayUnion(targetUserID) });
  await updateDoc(themRef, { followers: arrayUnion(currentUserID) });
}

export async function unfollowUser(currentUserID: string, targetUserID: string) {
  const meRef = doc(db, "profiles", currentUserID);
  const themRef = doc(db, "profiles", targetUserID);
  await updateDoc(meRef, { following: arrayRemove(targetUserID) });
  await updateDoc(themRef, { followers: arrayRemove(currentUserID) });
}



