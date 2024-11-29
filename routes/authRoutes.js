const express = require('express');
const { signupUser, loginUser, homePage, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');

const router = express.Router();

// Landing Page
router.get('/', (req, res) => {
  res.render('index');
});

// Signup Page
router.get('/signup', (req, res) => {
  res.render('signup');
});
router.post('/signup', signupUser);

// Login Page
router.get('/login', (req, res) => {
  res.render('login');
});
router.post('/login', loginUser);

// Home Page
router.get('/home', homePage);

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/home');
    }
    res.clearCookie('sid');
    res.redirect('/login');
  });
});

// Forgot Password Page
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password');  // Render the forgot-password.ejs page
});

// Forgot Password POST Route - to handle the form submission and send OTP
router.post('/forgot-password', forgotPassword); // Handle forgot password logic

// OTP Verification Page
router.get('/verify-otp', (req, res) => {
  const { email } = req.query;
  res.render('verify-otp', { email });  // Render the verify-otp.ejs page with email
});

// OTP Verification POST Route
router.post('/verify-otp', verifyOTP);

// Reset Password Page
router.get('/reset-password', (req, res) => {
  const { email } = req.query;
  res.render('reset-password', { email });  // Render the reset-password.ejs page with email
});

// Reset Password POST Route
router.post('/reset-password', resetPassword);

module.exports = router;
