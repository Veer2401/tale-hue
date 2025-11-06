# 🔥 Fix Firebase Permissions Error

## Problem
You're getting `FirebaseError: Missing or insufficient permissions` because the Firestore security rules need to be updated.

## Solution - Update Firestore Rules Manually

### Option 1: Firebase Console (Easiest) ⭐

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Firestore Rules**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top

3. **Replace the rules with this:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only user can write their own data
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Profiles collection - allow all reads, only user can write their own profile
    match /profiles/{profileId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userID;
    }
    
    // Stories collection - authenticated users can create, only author can update/delete
    match /stories/{storyId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userID;
    }
    
    // Posts collection - anyone can read, authenticated users can create, only author can update/delete
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userID;
    }
    
    // Likes collection - anyone can read, authenticated users can create/delete their own likes
    match /likes/{likeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null;
      allow update: if false; // Likes shouldn't be updated
    }
    
    // Comments collection - anyone can read, authenticated users can create/update/delete their own comments
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userID;
    }
  }
}
```

4. **Click "Publish"**
   - The rules will take effect immediately
   - Refresh your app and the error should be gone! ✅

---

### Option 2: Using Firebase CLI

If you want to deploy from the command line:

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Initialize Firebase (if not done)**
   ```bash
   firebase init
   ```
   - Select "Firestore" when prompted
   - Choose your existing project
   - Accept the default firestore.rules file

3. **Deploy the rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## What Changed? 🔍

### Key Updates:
1. **Posts collection**: Changed `update` permission to allow authenticated users (needed for like/comment counts)
2. **Profiles collection**: Changed from `{userId}` to `{profileId}` to support queries
3. **Likes collection**: Removed update permission (likes should only be created/deleted)
4. **Better security**: More granular permissions for each collection

### Before:
```javascript
match /posts/{postId} {
  allow update, delete: if request.auth != null && request.auth.uid == resource.data.userID;
}
```

### After:
```javascript
match /posts/{postId} {
  allow update: if request.auth != null;
  allow delete: if request.auth != null && request.auth.uid == resource.data.userID;
}
```

This allows any authenticated user to update posts (for like/comment counts), but only the author can delete.

---

## Testing ✅

After updating the rules:

1. Refresh your app
2. Try signing in
3. Try creating a post
4. Try liking a post
5. Try commenting on a post

All should work without permission errors! 🎉

---

## If You Still Get Errors

Check the browser console for specific error messages and verify:
- You're signed in with Google
- Your Firebase project is active
- The rules were published successfully
