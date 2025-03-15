const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { check } = require('express-validator');

const { body, validationResult } = require('express-validator');

router.post(
  '/signup',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    body('confirmPassword', 'Confirm Password is required').not().isEmpty(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    body('phone_no', 'Phone number is required').not().isEmpty(),
    body('phone_no', 'Phone number must be a valid number').isNumeric(),
  ],
  signup
);


router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], login);

module.exports = router;