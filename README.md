# TaleHue

## Overview

TaleHue is a modern web application designed for creating, sharing, and exploring AI-generated stories and images. Built with Next.js and integrated with Firebase, tale-hue offers a seamless experience for users to generate creative content, interact with a community, and manage their profiles securely.

## Features

- **AI Story & Image Generation:** Generate stories and images using advanced AI models (Gemini, OpenRouter, etc.).
- **User Authentication:** Secure login and registration powered by Firebase Auth.
- **Community Feed:** Browse, like, and comment on stories and images shared by other users.
- **Profile Management:** View and edit your profile, track your contributions.
- **Mobile Responsive:** Optimized for mobile and desktop devices.
- **Privacy & Security:** Strict Firestore and Storage rules, privacy policy, and security guidelines.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, PostCSS
- **Backend:** Firebase (Auth, Firestore, Storage)
- **AI Integration:** Gemini, OpenRouter, and other image generation APIs
- **Linting & Formatting:** ESLint, Prettier

## Folder Structure

```
tale-hue/
├── tales/
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   │   ├── api/           # API routes (image generation, etc.)
│   │   │   ├── globals.css    # Global styles
│   │   │   ├── layout.tsx     # App layout
│   │   │   └── page.tsx       # Main page
│   │   ├── components/        # React components (Feed, Profile, Sidebar, etc.)
│   │   ├── contexts/          # Context providers (AuthContext)
│   │   ├── lib/               # Utility libraries (firebase.ts)
│   │   └── types/             # TypeScript types
│   ├── firebase.json          # Firebase config
│   ├── firestore.rules        # Firestore security rules
│   ├── storage.rules          # Storage security rules
│   ├── FIREBASE_SETUP.md      # Firebase setup guide
│   ├── SETUP_GUIDE.md         # Project setup instructions
│   ├── MOBILE_RESPONSIVE.md   # Mobile optimization notes
│   ├── SUCCESS_NEXT_STEPS.md  # Next steps after setup
│   ├── URGENT_FIX.md          # Urgent fixes and issues
│   └── ...                    # Other configs and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Firebase account & project

### Installation

1. **Clone the repository:**
	```sh
	git clone https://github.com/Veer2401/tale-hue.git
	cd tale-hue/tales
	```
2. **Install dependencies:**
	```sh
	npm install
	# or
	yarn install
	```
3. **Configure Firebase:**
	- Follow instructions in `FIREBASE_SETUP.md` to set up Firebase Auth, Firestore, and Storage.
	- Update `firebase.json`, `firestore.rules`, and `storage.rules` as needed.
4. **Environment Variables:**
	- Create a `.env.local` file for API keys and Firebase config.
5. **Run the development server:**
	```sh
	npm run dev
	# or
	yarn dev
	```
6. **Access the app:**
	- Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Create Stories/Images:** Use the CreateStory component to generate new content.
- **Explore Feed:** Browse the Feed for community stories and images.
- **Profile:** Manage your profile and view your contributions.
- **Authentication:** Log in or register to access all features.

## Contributing

Contributions are welcome! Please read `SECURITY.md` and `SETUP_GUIDE.md` before submitting pull requests.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your branch
5. Open a pull request

## Security

See `SECURITY.md` for vulnerability reporting and security best practices.

## License

This project is licensed under the MIT License. See `LICENSE` for details.

## Maintainers

- Veer2401 ([GitHub](https://github.com/Veer2401))

## Acknowledgements

- OpenAI, Google Gemini, OpenRouter for AI APIs
- Firebase for backend infrastructure

---

For more details, see the individual markdown files in the `tales/` directory.
