const nodemailer = require('nodemailer');

// Create a reusable transporter object using your Gmail SMTP credentials
const sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Automatically uses smtp.gmail.com
    auth: {
      user: process.env.EMAIL_USER,  // Your Gmail address
      pass: process.env.EMAIL_PASS,  // Your generated app password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,  // Sender's email (your Gmail)
    to: email,  // Recipient's email (user's email entered in the form)
    subject: subject,  // Email subject
    text: text,  // Email body (OTP message)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully!');
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};

module.exports = sendEmail;
