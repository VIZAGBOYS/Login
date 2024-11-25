const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');

// Signup
const signupUser = async (req, res) => {
  const { name, email, phone, password, age, gender } = req.body;

  // Basic input validation (you can add more validations)
  if (!name || !email || !password || !phone || !age || !gender) {
    return res.status(400).send('All fields are required');
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send('User with this email already exists');
  }

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
    console.log('User signed up successfully!');
    res.redirect('/login');
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).send('Error signing up: ' + err);
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic input validation (you can add more validations)
  if (!email || !password) {
    return res.status(400).send('Both email and password are required');
  }

  // Check if the user exists
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send('User not found');
  }

  // Compare passwords
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).send('Incorrect password');
  }

  // Set session for the user
  req.session.userId = user._id;
  res.redirect('/home');
};

// Home Page
const homePage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  // Fetch user info (optional)
  User.findById(req.session.userId)
    .then((user) => {
      res.render('home', { user });  // Passing user to the home page template
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error fetching user data');
    });
};

// Logout
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');  // Redirect to landing page after logout
  });
};

module.exports = { signupUser, loginUser, homePage, logoutUser };
