# 🎨 Tale Hue - Stories in Color

A modern, aesthetic Gen-Z social platform where users write short stories (≤150 characters) and generate unique AI images using Google Gemini 2.5-Flash.

## ✨ Features

- 🔐 **Google Sign-In** - Seamless authentication with Firebase
- ✍️ **Story Creation** - Write short stories up to 150 characters
- 🤖 **AI Image Generation** - Create beautiful images with Gemini 2.5-Flash
- 📱 **Social Features** - Follow users, like stories, and build community
- 🎨 **Modern UI** - Clean, sexy, Gen-Z aesthetic design
- 🌙 **Dark Mode** - Fully responsive with dark mode support
- ☁️ **Cloud Storage** - Firebase Storage for all images
- 💾 **Real-time Database** - Firestore for instant updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini 2.5-Flash API
- **Icons**: Lucide React
- **Hosting**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project setup
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd tale-hue/tales
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

The `.env.local` file is already configured with:
- Firebase configuration
- Gemini API key

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
tales/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-image/    # Gemini API integration
│   │   ├── layout.tsx             # Root layout with AuthProvider
│   │   └── page.tsx               # Main app page
│   ├── components/
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   ├── Feed.tsx               # Stories feed
│   │   ├── CreateStory.tsx        # Story creation
│   │   ├── Profile.tsx            # User profile
│   │   └── Community.tsx          # Discover users
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication context
│   ├── lib/
│   │   └── firebase.ts            # Firebase configuration
│   └── types/
│       └── index.ts               # TypeScript interfaces
├── .env.local                     # Environment variables
└── package.json
```

## 🔥 Firestore Collections

### `users`
```json
{
  "uid": "iabc12354",
  "name": "User Name",
  "email": "user@gmail.com",
  "photoURL": "",
  "createdAt": "timestamp"
}
```

### `profiles`
```json
{
  "userID": "iabc12354",
  "displayName": "User Name",
  "bio": "Bio text",
  "profileImage": "",
  "followers": ["userId1", "userId2"],
  "following": ["userId3"],
  "stories": ["storyId1", "storyId2"]
}
```

### `stories`
```json
{
  "storyID": "story123",
  "userID": "iabc12354",
  "content": "Story text",
  "imageURL": "",
  "likesCount": 24,
  "commentsCount": 7,
  "createdAt": "timestamp"
}
```

### `likes` & `comments`
See main documentation for schema.

## 📦 Firebase Storage Structure

- Profile Images: `profileImages/{userId}/`
- Story Images (PNG): `stories/{userId}/`

## 🎨 UI/UX Features

- Instagram-inspired feed layout
- ChatGPT-inspired sidebar navigation
- Smooth gradient animations
- Responsive design for all devices
- Modern Gen-Z aesthetic
- Soft shadows and rounded corners

## 🚢 Deployment

### Vercel Deployment

1. Install Vercel CLI
```bash
npm i -g vercel
```

2. Deploy
```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Environment Variables on Vercel

Add all variables from `.env.local` to your Vercel project settings.

## 📝 Usage

1. **Sign In**: Click "Sign In with Google" in the sidebar
2. **Create Story**: Navigate to "Create Story" and write up to 150 characters
3. **Generate Image**: Click "Generate Image" to create an AI-powered visual
4. **Explore Feed**: View stories from all users in the feed
5. **Build Community**: Follow other creators in the Community section
6. **Manage Profile**: Update your bio and profile picture

## 🔐 Security

- Firebase Security Rules configured
- API keys stored in environment variables
- Client-side authentication checks
- Secure file uploads to Firebase Storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

See LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini API for AI image generation
- Firebase for backend services
- Vercel for hosting
- Lucide for beautiful icons

---

Built with 💜 for the Gen-Z community
