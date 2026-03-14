const User = require('../models/User');

exports.registerDevice = async (req, res) => {
  try {
    const { userId, fcmToken, deviceType, name, email } = req.body;

    const user = await User.findOneAndUpdate(
      { userId },
      { fcmToken, deviceType, name, email, isActive: true, lastSeen: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, message: 'Device registered', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', deviceType } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
      ];
    }
    if (deviceType) query.deviceType = deviceType;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    const { Parser } = require('json2csv');
    const users = await User.find({}).lean();
    const fields = ['userId', 'name', 'email', 'deviceType', 'isActive', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(users);
    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeDevices = await User.countDocuments({ isActive: true });
    const Notification = require('../models/Notification');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notificationsSentToday = await Notification.countDocuments({ createdAt: { $gte: today } });
    const deviceBreakdown = await User.aggregate([
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, stats: { totalUsers, activeDevices, notificationsSentToday, deviceBreakdown } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
