"use client";
import { useState } from "react";
import { auth, googleProvider, getInvisibleRecaptcha } from "@/lib/firebase";
import { signInWithPopup, signInWithPhoneNumber, signOut } from "firebase/auth";

export default function AuthButtons() {
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState<any>(null);

  const signInGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const sendCode = async () => {
    const verifier = getInvisibleRecaptcha("recaptcha-container");
    const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
    setConfirmResult(confirmation);
    setCodeSent(true);
  };

  const verifyCode = async () => {
    if (!confirmResult) return;
    await confirmResult.confirm(otp);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex flex-col gap-3">
      <button className="px-4 py-2 rounded-full bg-black text-white" onClick={signInGoogle}>Sign in with Google</button>
      <div className="flex gap-2 items-center">
        <input className="px-3 py-2 rounded-full bg-white/5 border border-white/10" placeholder="+1 555 555 5555" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button className="px-4 py-2 rounded-full bg-white text-black" onClick={sendCode}>Send code</button>
      </div>
      {codeSent && (
        <div className="flex gap-2 items-center">
          <input className="px-3 py-2 rounded-full bg-white/5 border border-white/10" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <button className="px-4 py-2 rounded-full bg-emerald-500 text-white" onClick={verifyCode}>Verify</button>
        </div>
      )}
      <button className="px-4 py-2 rounded-full bg-neutral-800 text-white" onClick={logout}>Sign out</button>
      <div id="recaptcha-container" />
    </div>
  );
}


