const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');

// OTP Verification Controller
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found.');
    }

    if (user.otp !== otp) {
      return res.status(400).send('Invalid OTP.');
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(401).send('OTP has expired.');
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.send('User verified successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error verifying OTP.');
  }
};

// Removed duplicate forgotPassword function


// Sign-Up Controller
const signupUser = async (req, res) => {
  const { name, email, phone, password, age, gender } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists.');
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      phone,
      password,
      age,
      gender,
      otp,
      otpExpiry,
    });

    await newUser.save();
    await sendEmail(newUser.email, 'Verify Your OTP', `Your OTP is: ${otp}`);

    res.status(200).send('OTP sent to your email for verification.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error during sign-up.');
  }
};

// Login Controller
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

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).send('Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const subject = 'Your OTP for Password Reset';
    await sendEmail(email, subject, `Your OTP is: ${otp}`);

    res.status(200).send(`OTP sent to ${email}`);
  } catch (error) {
    console.error('Error in forgotPassword:', error.message);
    res.status(500).send('Server error');
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  const { newPassword, confirmPassword, otp } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    const user = await User.findOne({ otp });

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(401).send('Expired OTP');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).send('Password successfully reset');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Home Page Controller
const homePage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.render('home');
};

module.exports = { signupUser, loginUser, homePage, verifyOTP, forgotPassword, resetPassword };
