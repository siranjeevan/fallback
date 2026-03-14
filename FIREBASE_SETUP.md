# Firebase Setup Guide

## 1. Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project" → enter a name → continue
3. Disable Google Analytics if not needed → Create project

## 2. Enable Cloud Messaging (FCM)

1. In your project, go to **Project Settings** (gear icon)
2. Click the **Cloud Messaging** tab
3. FCM is enabled by default for all Firebase projects

## 3. Generate a Service Account Key

1. Go to **Project Settings** → **Service accounts**
2. Click **"Generate new private key"**
3. Download the JSON file — keep it secret, never commit it

## 4. Configure the Backend

Copy values from the downloaded JSON into your `backend/.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

> Important: The private key must have `\n` (literal backslash-n) in the .env file, not actual newlines.

## 5. Get FCM Tokens from Client Apps

### Web (JavaScript)
```js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const app = initializeApp({ /* your firebase config */ });
const messaging = getMessaging(app);

const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
// POST token to: POST /api/register-device
```

### Android (Kotlin)
```kotlin
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    val token = task.result
    // POST token to your backend
}
```

### iOS (Swift)
```swift
Messaging.messaging().token { token, error in
    // POST token to your backend
}
```

## 6. VAPID Key (for Web Push)

1. Go to **Project Settings** → **Cloud Messaging**
2. Scroll to **Web configuration**
3. Click **"Generate key pair"** under Web Push certificates
4. Use the generated key as `vapidKey` in your web client
