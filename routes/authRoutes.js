const express = require('express');
const { signupUser, loginUser, homePage } = require('../controllers/authController');

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
      return res.render('logout', {
        message: 'An error occurred while logging out.',
        status: 'error',
      });
    }
    res.clearCookie('sid');
    res.render('logout', {
      message: 'Logout Successful!',
      status: 'success',
      redirectTo: '/login', // Redirect after successful logout
    });
  });
});


module.exports = router;
