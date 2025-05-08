import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send an email
export const SendMail = async (toEmail, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: toEmail, 
      subject: "Sending to OGERA sales - Your Timeless Journey Begins",
      html: `<html><body><h3>Dealer Enquiry :</h3></body></html>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", toEmail);
  } catch (error) {
    console.error("Error occurred while sending mail:", error);
    throw new Error("Error sending email");
  }
};
