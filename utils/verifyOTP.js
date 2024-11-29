const User = require('../models/usermodel');

// Utility function to verify OTP
const verifyOTP = async (email, otp) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    if (user.otpExpiry < Date.now()) {
      throw new Error('OTP has expired');
    }

    // OTP is valid, clear OTP fields and update user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = verifyOTP;
