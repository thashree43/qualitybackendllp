import bcrypt from 'bcryptjs';
import AdminModel from "../models/adminModel.js";
import { sendOtpVerificationMail } from "../services/otpservice.js";
import OtpModel from '../models/otpModel.js';
import {generatetoken} from "../services/token.js"

export const adminregister = async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body;
    console.log("the datas from the body", req.body);

    if (!username || !email || !mobile || !password) {
      return res.status(400).json({ message: 'Please provide all the required data' });
    }

    const existedEmail = await AdminModel.findOne({ email });

    if (existedEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminData = new AdminModel({
      name: username,
      email: email,
      mobile: mobile,
      password: passwordHash,
    });

    await adminData.save();
    console.log("Data has been saved", adminData);

    // Send OTP
    const otpResponse = await sendOtpVerificationMail(email);

    if (otpResponse.error) {
      return res.status(500).json({ message: otpResponse.error });
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        username: adminData.name,
        email: adminData.email,
        mobile: adminData.mobile,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error during registration" });
  }
};

export const VerifyOtp = async (req, res) => {
  const { email, otp1, otp2, otp3, otp4 } = req.body;
  console.log("Verification OTP Request:", req.body);
  
  try {
    const enteredOtp = otp1 + otp2 + otp3 + otp4;

    const otpData = await OtpModel.findOne({ email });
    console.log("OTP Data from DB:", otpData);
    
    if (!otpData) {
      return res.status(404).json({ message: 'OTP not found' });
    }

    if (otpData.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (enteredOtp === otpData.otp) {
      const adminData = await AdminModel.findOne({ email });
      await AdminModel.findByIdAndUpdate(
        adminData._id,
        { is_Admin: true, is_Verified: true }
      );

      // Clean up OTP
      await OtpModel.deleteOne({ email });

      return res.status(200).json({ message: 'Account verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

export const ResendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    await OtpModel.deleteOne({ email });

    const otpResponse = await sendOtpVerificationMail(email);

    if (otpResponse.error) {
      return res.status(500).json({ message: otpResponse.error });
    }

    return res.status(200).json({
      message: 'New OTP sent successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error resending OTP' });
  }
};
export const Login = async (req, res) => {
    const { email, password } = req.body;
    console.log("the login datas",req.body);
    
  
    try {
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: 'Email and password are required' });
      }
  
      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'User does not exist' });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, admin.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      if (!admin.is_Verified && !admin.is_Admin) {
        return res.status(403).json({ message: 'Please verify your account' });
      }
      console.log("222222");

      const token = generatetoken({
        id: admin._id,
        email: admin.email,
      });
  
      res.cookie('adminjwt', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      res.status(200).json({
        message: 'admin successfully logged in',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during login' });
    }
  };