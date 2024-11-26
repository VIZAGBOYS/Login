const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');




// verify otp 

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).send('Invalid or expired OTP.');
    }

    // Mark as verified and save
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.redirect('/login'); // Redirect to login page
  } catch (err) {
    console.error(err);
    res.status(500).send('Error verifying OTP.');
  }
};

// Signup
const signupUser = async (req, res) => {
  const { name, email, password, phone, age, gender } = req.body; // Ensure all fields are received

  try {
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Temporarily store user data
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        name, 
        email, 
        password, 
        phone,      // Make sure this is passed in
        age,        // Make sure this is passed in
        gender,     // Make sure this is passed in
        otp, 
        otpExpiry, 
        isVerified: false 
      });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }

    await user.save();

    // Send OTP email
    await sendEmail(email, 'Verify Your Email', `Your OTP is: ${otp}`);

    // Redirect to OTP verification page
    res.render('verify-otp', { email });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error during signup.');
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

module.exports = { signupUser, loginUser, homePage,  verifyOTP };
