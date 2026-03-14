# API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Auth

### POST /admin/login
Login as admin.

Request:
```json
{ "email": "admin@example.com", "password": "Admin@123456" }
```
Response:
```json
{ "success": true, "token": "jwt...", "admin": { "id": "...", "email": "...", "name": "..." } }
```

### GET /admin/me
Returns current admin profile. Protected.

---

## Devices

### POST /register-device
Register a user device token. Public endpoint (called from mobile/web apps).

Request:
```json
{
  "userId": "user_123",
  "fcmToken": "fcm_token_here",
  "deviceType": "android",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### GET /users
List all registered users. Protected.

Query params: `page`, `limit`, `search`, `deviceType`

### GET /users/export
Download users as CSV. Protected.

### GET /dashboard/stats
Returns dashboard statistics. Protected.

---

## Notifications

### POST /notifications/send
Send a push notification. Protected. Rate limited: 10/min.

Request:
```json
{
  "title": "Hello",
  "message": "This is a push notification",
  "image": "https://example.com/img.png",
  "userIds": ["user_123"],
  "scheduledAt": "2026-03-15T10:00:00.000Z"
}
```
- `userIds`: optional. If empty, sends to all active users.
- `scheduledAt`: optional. If provided, schedules the notification.

### GET /notifications/history
Paginated notification history. Protected.

Query params: `page`, `limit`

### GET /notifications/analytics
Returns 7-day daily stats and totals. Protected.

---

## Database Schema

### User
| Field | Type | Notes |
|-------|------|-------|
| userId | String | Unique, from client app |
| name | String | Optional |
| email | String | Optional |
| fcmToken | String | Required |
| deviceType | Enum | android / ios / web |
| isActive | Boolean | False if token invalid |
| lastSeen | Date | Updated on re-register |

### Admin
| Field | Type | Notes |
|-------|------|-------|
| email | String | Unique |
| password | String | bcrypt hashed |
| name | String | Display name |

### Notification
| Field | Type | Notes |
|-------|------|-------|
| title | String | Required |
| message | String | Required |
| image | String | Optional URL |
| sentTo | String | 'all' or userId list |
| recipientCount | Number | Total targeted |
| successCount | Number | FCM successes |
| failureCount | Number | FCM failures |
| scheduledAt | Date | If scheduled |
| status | Enum | sent / scheduled / failed |
