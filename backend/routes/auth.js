const router = require('express').Router();
const { body } = require('express-validator');
const { login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);

router.get('/me', protect, me);

module.exports = router;
