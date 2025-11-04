# 🚀 Tale Hue - Quick Setup Guide

## Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tale-hue-13d8f`

### Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add your authorized domains (localhost + your Vercel domain)

### Set up Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Start in **production mode**
3. Choose a location close to your users
4. Deploy the security rules:
   - Copy content from `firestore.rules`
   - Paste in Firestore Rules tab
   - Publish

### Set up Storage
1. Go to **Storage** → **Get started**
2. Start in **production mode**
3. Deploy the security rules:
   - Copy content from `storage.rules`
   - Paste in Storage Rules tab
   - Publish

## Step 2: Gemini API Setup

The Gemini API key is already configured in `.env.local`

To get a new key if needed:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Update `GEMINI_API_KEY` in `.env.local`

## Step 3: Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 4: Test the App

1. **Sign In**: Click "Sign In with Google"
2. **Create Profile**: Profile is auto-created on first login
3. **Create Story**: Write a story (max 150 chars) and generate image
4. **View Feed**: See all stories from users
5. **Follow Users**: Discover and follow other creators

## Step 5: Deploy to Vercel

### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Add environment variables from `.env.local`
4. Deploy!

### Option B: Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Add Environment Variables on Vercel
In your Vercel project settings, add:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `GEMINI_API_KEY`

## 🔒 Security Checklist

- ✅ Firebase Security Rules deployed
- ✅ Storage Rules deployed
- ✅ Environment variables configured
- ✅ Authorized domains added in Firebase Auth
- ✅ API keys stored securely

## 🎨 Customization

### Change Brand Colors
Edit the gradient colors in components:
- Purple: `from-purple-500`
- Pink: `via-pink-500`
- Orange: `to-orange-500`

### Modify Story Character Limit
Edit `maxLength` in `CreateStory.tsx` (currently 150)

### Add More Authentication Methods
Uncomment phone auth in `AuthContext.tsx` or add others

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Firebase Connection Issues
- Check Firebase config in `.env.local`
- Verify Firebase project is active
- Check browser console for errors

### Gemini API Issues
- Verify API key is valid
- Check API quotas in Google Cloud Console
- Review API call logs

## 📱 Features to Add

Ideas for future enhancements:
- 💬 Real-time comments on stories
- 🔔 Notifications for likes/follows
- 🔍 Search functionality
- #️⃣ Hashtags and trending topics
- 📊 Analytics dashboard
- 🎥 Video stories
- 🌐 Share to other platforms

## 🎉 You're All Set!

Your Tale Hue app is ready to go! Start creating beautiful stories with AI-generated images.

Need help? Check the main README or reach out to the community.

---

Happy storytelling! ✨
