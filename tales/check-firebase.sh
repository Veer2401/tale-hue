#!/bin/bash

echo "🔥 Tale Hue - Firebase Configuration Check"
echo "==========================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ ERROR: .env.local file not found!"
    echo "Please create .env.local file with your Firebase configuration."
    exit 1
fi

echo "✅ .env.local file found"
echo ""

# Check for required environment variables
echo "Checking environment variables..."
echo ""

required_vars=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
    "GEMINI_API_KEY"
)

missing_vars=0

for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env.local; then
        echo "✅ $var is set"
    else
        echo "❌ $var is MISSING"
        ((missing_vars++))
    fi
done

echo ""

if [ $missing_vars -gt 0 ]; then
    echo "❌ $missing_vars environment variable(s) missing!"
    echo ""
    echo "Please update your .env.local file with the correct values from Firebase Console."
    exit 1
fi

echo "✅ All required environment variables are set!"
echo ""

# Check for suspended API key
if grep -q "AIzaSyCOsaHpDM-kwDeMWoXLlDCDubCg4RR_e-w" .env.local; then
    echo "⚠️  WARNING: You're using the SUSPENDED API key!"
    echo ""
    echo "Your current API key has been suspended by Firebase."
    echo "Please follow these steps to get a new API key:"
    echo ""
    echo "1. Go to: https://console.firebase.google.com/project/tale-hue-13d8f/settings/general"
    echo "2. Scroll to 'Your apps' section"
    echo "3. Click on your web app OR create a new one"
    echo "4. Copy the new firebaseConfig"
    echo "5. Update .env.local with the new values"
    echo "6. Restart your dev server: npm run dev"
    echo ""
    exit 1
fi

echo "✅ API key looks valid (not the suspended one)"
echo ""
echo "==========================================="
echo "🎉 Configuration check complete!"
echo ""
echo "Next steps:"
echo "1. Make sure Google Sign-In is enabled in Firebase Console"
echo "2. Create Firestore Database in Firebase Console"
echo "3. Create Storage bucket in Firebase Console"
echo "4. Start dev server: npm run dev"
echo "5. Test sign-in at http://localhost:3000"
echo ""
echo "If you still see errors, check ERROR_FIX_GUIDE.md"
echo "==========================================="
