import 'dart:convert';
import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class FcmService {
  static final _messaging = FirebaseMessaging.instance;
  static final _localNotifications = FlutterLocalNotificationsPlugin();

  // ── Change this to your backend URL ──────────────────────────────────────
  static const String _backendUrl = 'http://10.0.2.2:5000/api'; // Android emulator
  // static const String _backendUrl = 'http://localhost:5000/api'; // iOS simulator
  // static const String _backendUrl = 'https://your-production-url.com/api';
  // ─────────────────────────────────────────────────────────────────────────

  static String? currentToken;

  static Future<void> init() async {
    // Request permission
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    debugPrint('FCM permission: ${settings.authorizationStatus}');

    // Init local notifications
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings();
    await _localNotifications.initialize(
      const InitializationSettings(android: androidSettings, iOS: iosSettings),
    );

    // Create Android notification channel
    if (Platform.isAndroid) {
      await _localNotifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(const AndroidNotificationChannel(
            'high_importance_channel',
            'High Importance Notifications',
            importance: Importance.max,
          ));
    }

    // Get token
    currentToken = await _messaging.getToken();
    debugPrint('FCM Token: $currentToken');

    if (currentToken != null) {
      await _saveToken(currentToken!);
      await registerWithBackend(currentToken!);
    }

    // Token refresh
    _messaging.onTokenRefresh.listen((newToken) async {
      currentToken = newToken;
      await _saveToken(newToken);
      await registerWithBackend(newToken);
    });

    // Foreground messages
    FirebaseMessaging.onMessage.listen((message) {
      _showLocalNotification(message);
    });

    // App opened from notification
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      debugPrint('Opened from notification: ${message.data}');
    });
  }

  static Future<void> registerWithBackend(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId') ?? _generateUserId();
      await prefs.setString('userId', userId);

      final response = await http.post(
        Uri.parse('$_backendUrl/register-device'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'fcmToken': token,
          'deviceType': Platform.isIOS ? 'ios' : 'android',
          'name': prefs.getString('userName') ?? 'Flutter User',
          'email': prefs.getString('userEmail') ?? '',
        }),
      );

      if (response.statusCode == 200) {
        debugPrint('✅ Device registered with backend');
      } else {
        debugPrint('❌ Backend registration failed: ${response.body}');
      }
    } catch (e) {
      debugPrint('❌ Backend registration error: $e');
    }
  }

  static Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    await _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          'high_importance_channel',
          'High Importance Notifications',
          importance: Importance.max,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: const DarwinNotificationDetails(),
      ),
    );
  }

  static Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fcmToken', token);
  }

  static Future<String?> getSavedToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('fcmToken');
  }

  static String _generateUserId() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return 'flutter_user_$timestamp';
  }
}
