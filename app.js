const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('./models/usermodel'); // Import the User model

// Load environment variables
dotenv.config();

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

// Handle OTP verification and password reset
app.post('/verify-otp', async (req, res) => {
  const { otp, 'new-password': newPassword } = req.body;

  const user = await User.findOne({ email: req.session.email });

  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).send('Invalid or expired OTP');
  }

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Redirect to the desired local URL after successful password reset
  res.redirect('http://localhost:3000'); // Replace with your desired local URL
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err); // Log MongoDB connection error
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});