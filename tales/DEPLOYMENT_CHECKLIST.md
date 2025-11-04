# ✅ Tale Hue - Pre-Deployment Checklist

## 🎯 Before You Deploy

### Firebase Console Setup (Required)

- [ ] **Authentication**
  - [ ] Enable Google Sign-In provider
  - [ ] Add authorized domains (localhost, your-vercel-domain.vercel.app)
  - [ ] Test sign-in flow locally

- [ ] **Firestore Database**
  - [ ] Create database (if not exists)
  - [ ] Deploy `firestore.rules` security rules
  - [ ] Verify rules are active
  - [ ] Test read/write permissions

- [ ] **Firebase Storage**
  - [ ] Initialize Storage
  - [ ] Deploy `storage.rules` security rules
  - [ ] Verify rules are active
  - [ ] Test file upload permissions

### Vercel Setup

- [ ] **Project Creation**
  - [ ] Import GitHub repository OR
  - [ ] Use Vercel CLI for deployment

- [ ] **Environment Variables**
  Add these in Vercel Dashboard → Settings → Environment Variables:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
  - [ ] `GEMINI_API_KEY`

- [ ] **Build Settings**
  - Framework Preset: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### Testing Locally

- [ ] **Core Features**
  - [ ] App loads at http://localhost:3000
  - [ ] Google Sign-In works
  - [ ] Profile auto-creates on first login
  - [ ] Can create a story (max 150 chars)
  - [ ] Image generation works
  - [ ] Story appears in feed
  - [ ] Can like stories
  - [ ] Can view other profiles
  - [ ] Can follow/unfollow users
  - [ ] Profile editing works
  - [ ] Profile picture upload works

- [ ] **UI/UX**
  - [ ] Sidebar navigation works
  - [ ] All views render correctly (Feed, Create, Profile, Community)
  - [ ] Responsive on mobile
  - [ ] Dark mode works (if applicable)
  - [ ] Loading states show properly
  - [ ] Error handling works

- [ ] **Data Persistence**
  - [ ] Stories save to Firestore
  - [ ] Images upload to Storage
  - [ ] Profile updates persist
  - [ ] Likes persist
  - [ ] Follows persist
  - [ ] Real-time updates work

### Code Quality

- [ ] **TypeScript**
  - [ ] No TypeScript errors: `npm run build`
  - [ ] Types properly defined

- [ ] **Environment**
  - [ ] `.env.local` not committed to git
  - [ ] `.gitignore` includes sensitive files
  - [ ] All API keys are in environment variables

- [ ] **Performance**
  - [ ] Images optimized
  - [ ] No console errors
  - [ ] No memory leaks

### Security

- [ ] **Firebase Rules**
  - [ ] Firestore rules prevent unauthorized access
  - [ ] Storage rules prevent unauthorized uploads
  - [ ] Test rules with different user accounts

- [ ] **API Keys**
  - [ ] All keys in environment variables
  - [ ] No hardcoded credentials
  - [ ] API keys restricted (if possible)

### Documentation

- [ ] **User Facing**
  - [ ] README is clear
  - [ ] Setup guide is complete
  - [ ] Usage instructions provided

- [ ] **Developer Facing**
  - [ ] Code is commented
  - [ ] File structure is clear
  - [ ] Components are documented

## 🚀 Deployment Steps

### Option 1: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect GitHub repository
4. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `tales/` (if needed)
   - Build Command: Keep default
5. Add environment variables (all 8 from `.env.local`)
6. Click "Deploy"
7. Wait for build to complete
8. Test deployed app
9. Add production domain to Firebase authorized domains

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# ... repeat for all vars

# Deploy to production
vercel --prod
```

## 🔧 Post-Deployment

- [ ] **Verify Deployment**
  - [ ] App loads on Vercel URL
  - [ ] Sign-in works on production
  - [ ] Stories can be created
  - [ ] Images upload correctly
  - [ ] All features work as expected

- [ ] **Firebase Configuration**
  - [ ] Add Vercel domain to Firebase authorized domains
  - [ ] Test authentication on production domain
  - [ ] Verify Storage CORS settings

- [ ] **Monitoring**
  - [ ] Check Vercel Analytics
  - [ ] Monitor Firebase usage
  - [ ] Check for errors in logs
  - [ ] Set up alerts (optional)

- [ ] **Domain (Optional)**
  - [ ] Connect custom domain in Vercel
  - [ ] Update DNS settings
  - [ ] Add custom domain to Firebase

## ⚠️ Common Issues & Solutions

### Issue: Firebase Auth Errors
**Solution**: Ensure Vercel domain is added to authorized domains in Firebase Console

### Issue: Image Upload Fails
**Solution**: Check Storage rules and verify CORS configuration

### Issue: Environment Variables Not Working
**Solution**: Redeploy after adding env vars in Vercel dashboard

### Issue: Build Fails
**Solution**: Check build logs, verify all dependencies are in package.json

### Issue: Real-time Updates Not Working
**Solution**: Verify Firestore rules allow read access

## 📊 Success Metrics

After deployment, verify:
- [ ] Page load time < 3 seconds
- [ ] Image upload < 5 seconds
- [ ] Sign-in < 2 seconds
- [ ] Feed updates in real-time
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SEO optimized

## 🎉 Launch Checklist

- [ ] All features working on production
- [ ] Firebase quotas checked
- [ ] Gemini API quota checked
- [ ] Error tracking set up
- [ ] Analytics configured
- [ ] User feedback mechanism ready
- [ ] Social sharing tested
- [ ] Performance optimized

---

## ✨ You're Ready to Launch!

Once all checkboxes are complete:
1. Share the URL with your first users
2. Monitor feedback and errors
3. Iterate based on user behavior
4. Enjoy your beautiful Tale Hue app! 🎨

**Current Status**: ✅ Development server running at http://localhost:3000

**Next Step**: Complete Firebase setup and deploy to Vercel!
