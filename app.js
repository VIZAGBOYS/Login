const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('./models/usermodel'); // Import the User model

// Load environment variables from gitignore/.env
dotenv.config({ path: path.join(__dirname, 'gitignore/.env') });

// Initialize Express
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');

// Session Management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
  })
);

// Routes
app.use(authRoutes);

// Forgot Password Route
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password'); // Render the forgot-password.ejs view
});

// Handle sending OTP
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    const otpExpiry = Date.now() + 3600000; // OTP expires in 1 hour

    // Find the user and update OTP and OTP expiry
    const user = await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { new: true }
    );

    if (!user) {
      console.error('User not found:', email);
      return res.status(404).send('User not found');
    }

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).send('Error sending OTP');
      }
      console.log('OTP sent:', info.response);
      res.send('OTP sent to your email');
    });
  } catch (error) {
    console.error('Error in /forgot-password:', error);
    res.status(500).send('An error occurred');
  }
});

// Handle OTP verification and password reset
app.post('/verify-otp', async (req, res) => {
  try {
    const { otp, 'new-password': newPassword } = req.body;

    const user = await User.findOne({ email: req.session.email });
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).send('Invalid or expired OTP');
    }

    // Hash the new password before saving
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.redirect('/login'); // Redirect to login page after successful reset
  } catch (error) {
    console.error('Error in /verify-otp:', error);
    res.status(500).send('An error occurred');
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
