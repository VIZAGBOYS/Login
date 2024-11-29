const nodemailer = require('nodemailer');

// Create a reusable transporter object using your Gmail SMTP credentials
const sendEmail = async (email, subject, otp) => {
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
    html: `
      <html lang="en">
        <head>
          <style>
            body {
              font-family: 'Roboto', sans-serif;
              background-color: #f4f7fc;
              margin: 0;
              padding: 0;
            }
            .email-container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 15px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
              text-align: center;
            }
            .otp {
              font-size: 32px;
              font-weight: bold;
              color: #4CAF50;
              background-color: #f1f8f3;
              padding: 10px;
              border-radius: 5px;
              letter-spacing: 3px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
            }
            .footer a {
              color: #4CAF50;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>OTP Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your One-Time Password (OTP) is:</p>
              <div class="otp">${otp}</div>
              <p>Please use this OTP to complete your verification process. If you did not request this, please disregard this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Do not reply to this email.</p>
              <p>For any questions, visit <a href="#">our support page</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `,  // HTML email body containing the OTP
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully!');
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};

module.exports = sendEmail;