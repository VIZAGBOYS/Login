const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');


//otp sending 
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }

    await user.save();
    await sendEmail(email, 'Verify Your Email', `Your OTP is: ${otp}`);

    res.status(200).json({ message: 'OTP sent to email!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending OTP.' });
  }
};

// verify otp 

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying OTP.' });
  }
};


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

module.exports = { signupUser, loginUser, homePage, sendOTP, verifyOTP };
