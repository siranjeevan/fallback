const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    image: { type: String, default: null },
    sentTo: { type: String, default: 'all' }, // 'all' or comma-separated userIds
    recipientCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    scheduledAt: { type: Date, default: null },
    status: { type: String, enum: ['sent', 'scheduled', 'failed'], default: 'sent' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
