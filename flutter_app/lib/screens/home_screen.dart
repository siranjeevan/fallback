import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../services/fcm_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? _token;
  String _status = 'Initializing...';
  final List<Map<String, String>> _messages = [];

  @override
  void initState() {
    super.initState();
    _loadToken();
    _listenToMessages();
  }

  Future<void> _loadToken() async {
    final token = await FcmService.getSavedToken();
    setState(() {
      _token = token;
      _status = token != null ? 'Registered ✓' : 'Not registered';
    });
  }

  void _listenToMessages() {
    FirebaseMessaging.onMessage.listen((message) {
      setState(() {
        _messages.insert(0, {
          'title': message.notification?.title ?? 'No title',
          'body': message.notification?.body ?? '',
          'time': DateTime.now().toString().substring(0, 19),
        });
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message.notification?.title ?? 'New notification'),
          backgroundColor: const Color(0xFF2563EB),
          behavior: SnackBarBehavior.floating,
        ),
      );
    });
  }

  void _copyToken() {
    if (_token == null) return;
    Clipboard.setData(ClipboardData(text: _token!));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Token copied to clipboard'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _refreshToken() async {
    setState(() => _status = 'Refreshing...');
    await FcmService.init();
    await _loadToken();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E3A5F),
        foregroundColor: Colors.white,
        title: const Text('FCM Client', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshToken,
            tooltip: 'Refresh token',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status card
            _StatusCard(status: _status),
            const SizedBox(height: 16),

            // Token card
            _TokenCard(token: _token, onCopy: _copyToken),
            const SizedBox(height: 16),

            // Messages
            if (_messages.isNotEmpty) ...[
              const Text(
                'Received Notifications',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ..._messages.map((m) => _MessageCard(message: m)),
            ] else
              const _EmptyState(),
          ],
        ),
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final String status;
  const _StatusCard({required this.status});

  @override
  Widget build(BuildContext context) {
    final isRegistered = status.contains('✓');
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isRegistered ? const Color(0xFFDCFCE7) : const Color(0xFFFEF9C3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isRegistered ? const Color(0xFF86EFAC) : const Color(0xFFFDE047),
        ),
      ),
      child: Row(
        children: [
          Icon(
            isRegistered ? Icons.check_circle : Icons.pending,
            color: isRegistered ? const Color(0xFF16A34A) : const Color(0xFFCA8A04),
          ),
          const SizedBox(width: 10),
          Text(
            status,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: isRegistered ? const Color(0xFF15803D) : const Color(0xFF92400E),
            ),
          ),
        ],
      ),
    );
  }
}

class _TokenCard extends StatelessWidget {
  final String? token;
  final VoidCallback onCopy;
  const _TokenCard({required this.token, required this.onCopy});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.key, size: 18, color: Color(0xFF2563EB)),
              const SizedBox(width: 8),
              const Text(
                'FCM Token',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const Spacer(),
              if (token != null)
                IconButton(
                  icon: const Icon(Icons.copy, size: 18),
                  onPressed: onCopy,
                  tooltip: 'Copy token',
                  color: const Color(0xFF2563EB),
                ),
            ],
          ),
          const SizedBox(height: 8),
          if (token != null)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                token!,
                style: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: Color(0xFF475569),
                ),
              ),
            )
          else
            const Text(
              'Token not available yet...',
              style: TextStyle(color: Color(0xFF94A3B8)),
            ),
        ],
      ),
    );
  }
}

class _MessageCard extends StatelessWidget {
  final Map<String, String> message;
  const _MessageCard({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.notifications, color: Color(0xFF2563EB), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message['title'] ?? '',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                if ((message['body'] ?? '').isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    message['body']!,
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  message['time'] ?? '',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48),
        child: Column(
          children: [
            Icon(Icons.notifications_none, size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 12),
            Text(
              'No notifications yet',
              style: TextStyle(color: Colors.grey.shade400, fontSize: 15),
            ),
            const SizedBox(height: 4),
            Text(
              'Send one from the admin dashboard',
              style: TextStyle(color: Colors.grey.shade400, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}
