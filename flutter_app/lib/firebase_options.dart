import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) return web;
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError('Unsupported platform');
    }
  }

  // ── Replace these with your actual values from google-services.json ──────
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBAaOGInY7fXnTbMEjfDTPUqBtFeWSlUpc',
    appId: '1:63545003562:android:REPLACE_WITH_ANDROID_APP_ID',
    messagingSenderId: '63545003562',
    projectId: 'portfolio-1820s',
    storageBucket: 'portfolio-1820s.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBAaOGInY7fXnTbMEjfDTPUqBtFeWSlUpc',
    appId: '1:63545003562:ios:REPLACE_WITH_IOS_APP_ID',
    messagingSenderId: '63545003562',
    projectId: 'portfolio-1820s',
    storageBucket: 'portfolio-1820s.firebasestorage.app',
    iosBundleId: 'com.example.fcmClient',
  );

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBAaOGInY7fXnTbMEjfDTPUqBtFeWSlUpc',
    appId: '1:63545003562:web:d885a4626d9486da4f7d53',
    messagingSenderId: '63545003562',
    projectId: 'portfolio-1820s',
    storageBucket: 'portfolio-1820s.firebasestorage.app',
    measurementId: 'G-L0G0BGRJ09',
  );
}
