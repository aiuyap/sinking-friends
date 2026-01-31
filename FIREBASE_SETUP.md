# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project (e.g., "sinking-fund-platform")
4. Click "Continue" and enable Google Analytics (optional)
5. Wait for project creation

## Step 2: Enable Google Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Google** 
3. Enable it
4. Add authorized domain: `localhost:3000`
5. Click **Save**

## Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon → Project Settings)
2. Scroll down to "Your apps" section
3. Click **Web (</>)** icon
4. Register app: "sinking-fund-web"
5. Copy the **firebaseConfig** object

## Step 4: Create Environment File

Create `.env.local` file in your project root and add:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Database (for later)
DATABASE_URL="postgresql://username:password@localhost:5432/sinking_fund_db"
```

Replace the values with your actual Firebase configuration.

## Step 5: Restart Dev Server

After saving `.env.local`, restart the server:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

The app should now load successfully at http://localhost:3000

## Next Steps

After Firebase is working:

1. Set up PostgreSQL database (optional for MVP - currently using mock data)
2. Update API routes to use real database queries
3. Test creating groups, funds, and payments
