# 🚨 CRITICAL: Firebase API Key Suspended - Immediate Fix Required

## ⚡ The Problem

Your Firebase API key `AIzaSyCOsaHpDM-kwDeMWoXLlDCDubCg4RR_e-w` has been **SUSPENDED**.

This is why you're seeing these errors:
- ❌ `auth/permission-denied: consumer 'api-key:...' has been suspended`
- ❌ `auth/popup-blocked`
- ❌ `auth/cancelled-popup-request`
- ❌ `INTERNAL ASSERTION FAILED: Pending promise was never set`

## ✅ The Solution (5 Minutes)

### Step 1: Get New Firebase Credentials

1. **Open Firebase Console:**
   ```
   https://console.firebase.google.com/project/tale-hue-13d8f/settings/general
   ```

2. **Scroll down to "Your apps" section**

3. **Option A: If you have an existing web app**
   - Click on the web app (</> icon)
   - Look for the `firebaseConfig` code
   - Copy all the values

4. **Option B: Create a new web app (Recommended)**
   - Click "Add app" button
   - Click Web icon (</>)
   - Give it a name: "Tale Hue Web App"
   - Click "Register app"
   - You'll see the config - **COPY IT**

   It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",  // ← COPY THIS
     authDomain: "tale-hue-13d8f.firebaseapp.com",
     projectId: "tale-hue-13d8f",
     storageBucket: "tale-hue-13d8f.firebasestorage.app",
     messagingSenderId: "1048006726669",
     appId: "1:1048006726669:web:...",  // ← COPY THIS
     measurementId: "G-..."  // ← COPY THIS
   };
   ```

### Step 2: Update Your .env.local File

1. **Open this file in your editor:**
   ```
   /Users/veer/Documents/Coding projects and files/app-1/tale-hue/tales/.env.local
   ```

2. **Replace with your NEW values:**
   ```bash
   # Firebase Configuration - NEW CREDENTIALS
   NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_NEW_API_KEY_HERE
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tale-hue-13d8f.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tale-hue-13d8f
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tale-hue-13d8f.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1048006726669
   NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_NEW_APP_ID_HERE
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_NEW_MEASUREMENT_ID_HERE

   # Gemini API Key (keep as is)
   GEMINI_API_KEY=AIzaSyDk36jLh9LcAUNuTVEuKtcdB_o5p4ybEDc
   ```

3. **Save the file**

### Step 3: Enable Google Sign-In

1. **Go to Authentication in Firebase Console:**
   ```
   https://console.firebase.google.com/project/tale-hue-13d8f/authentication/providers
   ```

2. **Click "Get started" (if first time)**

3. **Click "Google" provider**

4. **Toggle "Enable"**

5. **Select your email as support email**

6. **Click "Save"**

### Step 4: Create Firestore Database

1. **Go to Firestore Database:**
   ```
   https://console.firebase.google.com/project/tale-hue-13d8f/firestore
   ```

2. **Click "Create database"**

3. **Select "Start in test mode"** (for now)

4. **Choose location:** `us-central` or closest to you

5. **Click "Enable"**

### Step 5: Create Storage Bucket

1. **Go to Storage:**
   ```
   https://console.firebase.google.com/project/tale-hue-13d8f/storage
   ```

2. **Click "Get started"**

3. **Select "Start in test mode"**

4. **Use default location**

5. **Click "Done"**

### Step 6: Restart Your Dev Server

1. **Stop the current server** (if running)
   - Press `Ctrl + C` in the terminal

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   ```

3. **Start fresh:**
   ```bash
   npm run dev
   ```

### Step 7: Test Sign-In

1. **Open:** http://localhost:3000

2. **Clear browser cache:**
   - Chrome/Brave: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
   - Safari: `Cmd + Option + E` then reload

3. **Click "Sign In with Google"**

4. **Allow popups if prompted**

5. **Select your Google account**

6. **You should be signed in! 🎉**

---

## 🔧 Additional Fixes Applied

I've already updated your code to handle these issues:

### ✅ Popup Blocker Fix
- Now uses **redirect method** as fallback
- If popup is blocked, automatically switches to redirect
- No more popup errors!

### ✅ Better Error Handling
- Shows user-friendly error messages
- Displays specific issues (suspended key, blocked popup, etc.)
- Error messages appear in the sidebar

### ✅ Loading States
- Shows "Signing In..." while processing
- Prevents multiple sign-in attempts
- Better UX feedback

---

## 🧪 Verification Steps

After following all steps above, verify:

- [ ] New API key added to `.env.local`
- [ ] Dev server restarted
- [ ] Google Sign-In enabled in Firebase
- [ ] Firestore Database created
- [ ] Storage bucket created
- [ ] Browser cache cleared
- [ ] Can click "Sign In with Google"
- [ ] Successfully signed in
- [ ] No errors in browser console

---

## 🆘 Still Having Issues?

### Error: "popup-blocked"
**Solution:** Allow popups in your browser OR the app will automatically use redirect

### Error: "unauthorized-domain"
**Solution:** 
1. Go to Firebase Console → Authentication → Settings
2. Add `localhost` to authorized domains

### Error: "permission-denied"
**Solution:** You're still using the old suspended API key - go back to Step 1

### Error: Can't create Firestore
**Solution:** Make sure billing is enabled in Google Cloud Console

---

## 📞 Quick Help Commands

Run this to check your configuration:
```bash
cd /Users/veer/Documents/Coding\ projects\ and\ files/app-1/tale-hue/tales
chmod +x check-firebase.sh
./check-firebase.sh
```

---

## ✨ What I Changed in Your Code

1. **AuthContext.tsx**
   - Added redirect authentication fallback
   - Better error handling
   - Persistence configuration
   - Error state management

2. **Sidebar.tsx**
   - Error message display
   - Loading state for sign-in
   - Disabled state while signing in

3. **CreateStory.tsx**
   - Error handling for auth and upload
   - Better user feedback
   - Error message display

---

## 🎯 Summary

**Main Issue:** Suspended Firebase API key  
**Fix:** Get new credentials from Firebase Console  
**Time:** 5 minutes  
**Status:** Code is ready, you just need to update the API key!

Once you update `.env.local` with new credentials and restart the server, everything will work perfectly! 🚀

---

**Need the exact steps again?**
1. Visit: https://console.firebase.google.com/project/tale-hue-13d8f/settings/general
2. Get new config
3. Update .env.local
4. Restart: `npm run dev`
5. Test at: http://localhost:3000
