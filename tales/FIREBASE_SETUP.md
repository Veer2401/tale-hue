# 🔥 Firebase Setup Commands

## Quick Firebase CLI Setup (Optional but Recommended)

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase in Your Project

```bash
cd /Users/veer/Documents/Coding\ projects\ and\ files/app-1/tale-hue/tales
firebase init
```

**Select:**
- ✅ Firestore
- ✅ Storage
- ✅ Hosting (optional)

**Configuration:**
- Use existing project: `tale-hue-13d8f`
- Firestore rules file: `firestore.rules` ✅ (already created)
- Firestore indexes file: `firestore.indexes.json` (default)
- Storage rules file: `storage.rules` ✅ (already created)

### 4. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy both
firebase deploy --only firestore:rules,storage:rules
```

### 5. Verify Deployment

```bash
# Check what's deployed
firebase projects:list

# View current project info
firebase use
```

## 📋 Manual Setup (Via Firebase Console)

If you prefer using the web interface:

### Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **tale-hue-13d8f**
3. Navigate to **Firestore Database** → **Rules**
4. Copy content from `firestore.rules` file
5. Paste and **Publish**

### Storage Rules

1. In Firebase Console
2. Navigate to **Storage** → **Rules**
3. Copy content from `storage.rules` file
4. Paste and **Publish**

## 🔐 Firebase Authentication Setup

### Enable Google Sign-In

1. Go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. Click **Enable**
4. Add authorized domains:
   - `localhost` ✅ (already added)
   - Your Vercel domain (add after deployment)
   
   Example: `tale-hue.vercel.app`

5. **Save**

## 💾 Initialize Firestore Database

If not already created:

1. Go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose location: `us-central` (or closest to your users)
5. Click **Enable**
6. Deploy rules (see above)

## 📦 Initialize Firebase Storage

If not already created:

1. Go to **Storage**
2. Click **Get started**
3. Select **Start in production mode**
4. Use default location
5. Click **Done**
6. Deploy rules (see above)

## 🗂️ Create Required Indexes (Optional)

For better query performance:

### Via Console:
1. Go to **Firestore Database** → **Indexes**
2. Add these composite indexes:

**Stories Index:**
- Collection: `stories`
- Fields: `createdAt` (Descending)
- Query scope: Collection

**Likes Index:**
- Collection: `likes`
- Fields: `storyID` (Ascending), `userID` (Ascending)
- Query scope: Collection

### Via CLI:
Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "stories",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "likes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "storyID", "order": "ASCENDING" },
        { "fieldPath": "userID", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Then deploy:
```bash
firebase deploy --only firestore:indexes
```

## 🧪 Test Your Firebase Setup

### Test Authentication:
```javascript
// Run this in browser console when on localhost:3000
firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
  .then((result) => console.log('Success!', result.user))
  .catch((error) => console.error('Error:', error));
```

### Test Firestore Write:
```javascript
// In browser console
const db = firebase.firestore();
db.collection('test').add({ message: 'Hello Tale Hue!' })
  .then((docRef) => console.log('Document written with ID:', docRef.id))
  .catch((error) => console.error('Error:', error));
```

### Test Storage Upload:
```javascript
// In browser console
const storage = firebase.storage();
const ref = storage.ref('test/hello.txt');
ref.putString('Hello Tale Hue!').then((snapshot) => {
  console.log('Uploaded!');
});
```

## 📊 Monitor Usage

```bash
# View Firebase usage dashboard
firebase open

# Check Firestore usage
firebase firestore:stats

# View logs
firebase functions:log
```

## 🚨 Important Security Notes

1. **Never commit `.env.local` to git**
2. **Always use security rules in production**
3. **Restrict API keys in Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** → **Credentials**
   - Click on your API key
   - Add application restrictions
   - Add API restrictions (limit to Firebase services)

4. **Enable App Check (Recommended for Production):**
   ```bash
   firebase init appcheck
   firebase deploy --only appcheck
   ```

## 🔄 Update Rules After Changes

Whenever you modify `firestore.rules` or `storage.rules`:

```bash
# Deploy updated rules
firebase deploy --only firestore:rules,storage:rules
```

## 📈 Set Up Firebase Analytics (Optional)

Already configured in your Firebase config! Just enable in console:

1. Go to **Analytics** in Firebase Console
2. Enable Google Analytics
3. Link to existing GA4 property or create new one
4. View analytics in Firebase dashboard

## ✅ Verification Checklist

After setup, verify:

- [ ] Firebase CLI installed and logged in
- [ ] Project initialized (`firebase init`)
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Google Sign-In enabled
- [ ] Authorized domains added
- [ ] Firestore database created
- [ ] Storage bucket created
- [ ] Test authentication works
- [ ] Test Firestore read/write works
- [ ] Test Storage upload works

## 🎉 Setup Complete!

Your Firebase backend is now fully configured and ready to use with Tale Hue!

**Test your app**: http://localhost:3000

---

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs)
