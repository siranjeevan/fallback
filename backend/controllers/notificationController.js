const User = require('../models/User');
const Notification = require('../models/Notification');
const initFirebase = require('../firebase/admin');
const cron = require('node-cron');

// In-memory scheduled jobs map
const scheduledJobs = new Map();

const sendFCMMessages = async (tokens, payload) => {
  const admin = initFirebase();
  const messaging = admin.messaging();

  const results = { success: 0, failure: 0, invalidTokens: [] };

  // FCM sendEachForMulticast supports up to 500 tokens
  const chunkSize = 500;
  for (let i = 0; i < tokens.length; i += chunkSize) {
    const chunk = tokens.slice(i, i + chunkSize);
    const message = {
      notification: {
        title: payload.title,
        body: payload.message,
        ...(payload.image && { imageUrl: payload.image }),
      },
      tokens: chunk,
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      results.success += response.successCount;
      results.failure += response.failureCount;

      response.responses.forEach((r, idx) => {
        if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
          results.invalidTokens.push(chunk[idx]);
        }
      });
    } catch (err) {
      results.failure += chunk.length;
    }
  }

  // Clean up invalid tokens
  if (results.invalidTokens.length > 0) {
    await User.updateMany(
      { fcmToken: { $in: results.invalidTokens } },
      { isActive: false }
    );
  }

  return results;
};

exports.sendNotification = async (req, res) => {
  try {
    const { title, message, image, userIds, scheduledAt } = req.body;

    // Handle scheduled notifications
    if (scheduledAt) {
      const scheduleDate = new Date(scheduledAt);
      if (scheduleDate <= new Date()) {
        return res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
      }

      const notification = await Notification.create({
        title, message, image,
        sentTo: userIds?.length ? userIds.join(',') : 'all',
        status: 'scheduled',
        scheduledAt: scheduleDate,
      });

      // Schedule the job
      const cronExpr = `${scheduleDate.getMinutes()} ${scheduleDate.getHours()} ${scheduleDate.getDate()} ${scheduleDate.getMonth() + 1} *`;
      const job = cron.schedule(cronExpr, async () => {
        await executeNotification(notification._id, title, message, image, userIds);
        job.stop();
        scheduledJobs.delete(notification._id.toString());
      });
      scheduledJobs.set(notification._id.toString(), job);

      return res.json({ success: true, message: 'Notification scheduled', notification });
    }

    // Send immediately
    const query = userIds?.length ? { userId: { $in: userIds }, isActive: true } : { isActive: true };
    const users = await User.find(query).select('fcmToken');
    const tokens = users.map((u) => u.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(404).json({ success: false, message: 'No active devices found' });
    }

    const results = await sendFCMMessages(tokens, { title, message, image });

    const notification = await Notification.create({
      title, message, image,
      sentTo: userIds?.length ? userIds.join(',') : 'all',
      recipientCount: tokens.length,
      successCount: results.success,
      failureCount: results.failure,
      status: 'sent',
    });

    res.json({ success: true, notification, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const executeNotification = async (notificationId, title, message, image, userIds) => {
  const query = userIds?.length ? { userId: { $in: userIds }, isActive: true } : { isActive: true };
  const users = await User.find(query).select('fcmToken');
  const tokens = users.map((u) => u.fcmToken).filter(Boolean);
  if (tokens.length === 0) return;

  const results = await sendFCMMessages(tokens, { title, message, image });
  await Notification.findByIdAndUpdate(notificationId, {
    recipientCount: tokens.length,
    successCount: results.success,
    failureCount: results.failure,
    status: 'sent',
  });
};

exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Notification.countDocuments();
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, notifications, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const daily = await Notification.aggregate([
      { $match: { createdAt: { $gte: last7Days }, status: 'sent' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          totalSent: { $sum: '$successCount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totals = await Notification.aggregate([
      { $match: { status: 'sent' } },
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          totalSuccess: { $sum: '$successCount' },
          totalFailure: { $sum: '$failureCount' },
        },
      },
    ]);

    res.json({ success: true, daily, totals: totals[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
