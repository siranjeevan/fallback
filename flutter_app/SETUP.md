# Flutter FCM Client — Setup Guide

## 1. Add Android App to Firebase

1. Go to Firebase Console → portfolio-1820s → Project Settings
2. Click "Add app" → Android
3. Package name: `com.example.fcm_client`
4. Download `google-services.json`
5. Place it at: `flutter_app/android/app/google-services.json`

## 2. Add iOS App to Firebase (optional)

1. Click "Add app" → iOS
2. Bundle ID: `com.example.fcmClient`
3. Download `GoogleService-Info.plist`
4. Place it at: `flutter_app/ios/Runner/GoogleService-Info.plist`

## 3. Update firebase_options.dart

After downloading google-services.json, open it and copy:
- `mobilesdk_app_id` → replace `REPLACE_WITH_ANDROID_APP_ID` in firebase_options.dart

## 4. Update Backend URL in fcm_service.dart

In `flutter_app/lib/services/fcm_service.dart`, set `_backendUrl`:

- Android emulator → `http://10.0.2.2:5000/api`
- iOS simulator   → `http://localhost:5000/api`
- Real device     → `http://YOUR_MACHINE_IP:5000/api`

Find your machine IP:
```bash
ipconfig getifaddr en0
```

## 5. Run the app

```bash
cd flutter_app
flutter pub get
flutter run
```

## 6. What happens

1. App launches → requests notification permission
2. Gets FCM token from Firebase
3. Auto-registers token with your backend (POST /api/register-device)
4. Token appears in the Admin Dashboard → Users page
5. Send a notification from the dashboard → app receives it instantly
