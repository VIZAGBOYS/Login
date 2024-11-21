const express = require('express');
const router = express.Router();
const User = require('../models/usermodel');

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});


router.get('/', (req, res) => {
  res.render('home', { title: 'Home Page' });
});

// Render signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup form submission
router.post('/signup', async (req, res) => {
  const { username, email, password, phone } = req.body;
  try {
    const newUser = new User({ username, email, password, phone });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// Handle login form submission
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.redirect('/login?error=invalid');
    }
    res.redirect('/home');
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Render home page after login
router.get('/home', (req, res) => {
  res.render('home');
});

module.exports = router;
