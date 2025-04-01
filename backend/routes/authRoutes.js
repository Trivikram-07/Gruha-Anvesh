// const express = require('express');
// const router = express.Router();
// const { signup, login } = require('../controllers/authController');
// const { check } = require('express-validator');

// const { body, validationResult } = require('express-validator');

// router.post(
//   '/signup',
//   [
//     body('username', 'Username is required').not().isEmpty(),
//     body('email', 'Please include a valid email').isEmail(),
//     body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
//     body('confirmPassword', 'Confirm Password is required').not().isEmpty(),
//     body('confirmPassword').custom((value, { req }) => {
//       if (value !== req.body.password) {
//         throw new Error('Passwords do not match');
//       }
//       return true;
//     }),
//     body('phone_no', 'Phone number is required').not().isEmpty(),
//     body('phone_no', 'Phone number must be a valid number').isNumeric(),
//   ],
//   signup
// );


// router.post('/login', [
//   check('email', 'Please include a valid email').isEmail(),
//   check('password', 'Password is required').exists()
// ], login);

// module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Assuming password hashing
const { body } = require('express-validator'); // Import this!
const { signup } = require('../controllers/authController');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log('Login successful, token generated:', token);
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error during login' });
  }
});


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

module.exports = router;