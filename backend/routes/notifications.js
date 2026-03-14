const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { sendNotification, sendToToken, getHistory, getAnalytics } = require('../controllers/notificationController');
const { validate } = require('../middleware/validate');

const notifLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, slow down.' },
});

router.post(
  '/send',
  notifLimiter,
  [body('title').notEmpty(), body('message').notEmpty()],
  validate,
  sendNotification
);

router.post(
  '/send-token',
  notifLimiter,
  [body('title').notEmpty(), body('message').notEmpty(), body('token').notEmpty()],
  validate,
  sendToToken
);

router.get('/history', getHistory);
router.get('/analytics', getAnalytics);

module.exports = router;
