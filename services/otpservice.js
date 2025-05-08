import nodemailer from 'nodemailer';
import OtpModel from '../models/otpModel.js';
import AdminModel from '../models/adminModel.js';

const generateotp = (length = 4) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpVerificationMail = async (email) => {
  try {
    const user = await AdminModel.findOne({ email });

    if (!user) {
      return { error: 'Email not found' };
    }

    const otp = generateotp();
    console.log('Generated OTP:', otp);

    // Save OTP to the database
    await OtpModel.updateOne(
      { email },
      { otp, createdAt: new Date(), expiresAt: new Date(Date.now() + 60000) },
      { upsert: true }
    );

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Verify Your OGERA Account - Your Timeless Journey Begins',
      html: `<html><body>Your OTP is: ${otp}</body></html>`,
    };

    // Send OTP email
    await transporter.sendMail(mailOptions);
    console.log('OTP Email sent successfully');

    return { otp }; // Return OTP in case you need to debug
  } catch (error) {
    console.log('Error sending OTP email:', error.message);
    return { error: 'Error sending OTP email' };
  }
};
