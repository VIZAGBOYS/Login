const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');

// Signup
const signupUser = async (req, res) => {
  const { name, email, phone, password, age, gender } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    phone,
    password: hashedPassword,
    age,
    gender,
  });

  try {
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.status(500).send('Error signing up: ' + err);
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send('User not found');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).send('Incorrect password');
  }

  req.session.userId = user._id;
  res.redirect('/home');
};

// Home
const homePage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('home');
};

module.exports = { signupUser, loginUser, homePage };
