const express = require('express');
const { signupUser, loginUser, homePage } = require('../controllers/authController');
const { forgotPassword, verifyOTP ,resetPassword} = require('../controllers/authController');


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

// logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/home');
    }
    res.clearCookie('sid');
    res.redirect('/login');
  });
});
//entering details
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password');  // Render the forgot-password.ejs page
});

// Forgot Password POST Route - to handle the form submission and send OTP
router.post('/forgot-password', forgotPassword); // Handle forgot password logic

//otp 


router.post('/verify-otp', verifyOTP);
//reset password
router.post('/reset-password', resetPassword);

module.exports = router;