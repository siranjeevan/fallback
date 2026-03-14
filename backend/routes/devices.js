const router = require('express').Router();
const { body } = require('express-validator');
const { registerDevice, getUsers, exportUsers, getDashboardStats } = require('../controllers/deviceController');
const { validate } = require('../middleware/validate');

router.post(
  '/register-device',
  [
    body('userId').notEmpty(),
    body('fcmToken').notEmpty(),
    body('deviceType').isIn(['android', 'ios', 'web']),
  ],
  validate,
  registerDevice
);

router.get('/users', getUsers);
router.get('/users/export', exportUsers);
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
