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
    res.render('signup', {
      message: 'Signup Successful! Redirecting to login...',
      status: 'success',
      redirectTo: '/login',  // Redirect to login after signup
    });
  } catch (err) {
    console.error('Error saving user:', err);
    res.render('signup', {
      message: 'Error signing up. Please try again.',
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
// Home Page
const homePage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  User.findById(req.session.userId)
    .then((user) => {
      res.render('home', { user });  
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
    res.clearCookie('sid');
    res.render('logout', {
      message: 'Logout Successful! Redirecting to home...',
      status: 'success',
      redirectTo: '/home',  // Redirect to home after logout
    });
  });
};

module.exports = { signupUser, loginUser, homePage, logoutUser };
