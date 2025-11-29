const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('role').optional().isIn(['patient', 'clinician'])
  ],
  authController.register
);

router.post('/login', authController.login);

router.get('/nhs-sso', authController.nhsSsoLogin);

router.post('/nhs-sso/callback', authController.nhsSsoCallback);

router.get('/me', authenticate, authController.getCurrentUser);

router.put('/profile', authenticate, authController.updateProfile);

router.post('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 })
  ],
  authController.changePassword
);

module.exports = router;
