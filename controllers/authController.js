const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');

// Signup
const signupUser = async (req, res) => {
  const { name, email, phone, password, age, gender } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      age,
      gender,
    });

    await user.save();
    res.render('signup', {
      message: 'Signup Successful! Please login.',
      status: 'success',
    });
  } catch (err) {
    res.render('signup', {
      message: `Signup Failed: ${err.message}`,
      status: 'error',
    });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('login', {
        message: 'User not found!',
        status: 'error',
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render('login', {
        message: 'Incorrect password!',
        status: 'error',
      });
    }

    req.session.userId = user._id;
    // Render login with a success message and redirect client-side
    res.render('login', {
      message: 'Login Successful! Redirecting...',
      status: 'success',
      redirectTo: '/home',
    });
  } catch (err) {
    res.render('login', {
      message: `An error occurred during login: ${err.message}`,
      status: 'error',
    });
  }
};

// Home
const homePage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('home');
};

module.exports = { signupUser, loginUser, homePage };
