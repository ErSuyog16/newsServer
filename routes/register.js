const express = require("express");
const router = express.Router();
const User = require("../models/userData");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { route } = require("./user.route");
const saltRounds = 10;

// Route to register a new user
router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    // Create a new user instance with the provided data
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = new User({
      username: req.body.username,
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      instituteName: req.body.instituteName,
      country: req.body.country,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Send verification email
    // sendVerificationEmail(savedUser.email);

    res.status(200).json({
      message:
        "User registered successfully. Please verify your email to log in.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Function to send verification email
function sendVerificationEmail(email) {
  // Code to send email using nodemailer
  // Example code, replace with your actual email sending logic
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "u20cs107@coed.svnit.ac.in",
      pass: "@Suyog123.",
    },
  });

  const mailOptions = {
    from: "u20cs107@coed.svnit.ac.in",
    to: email,
    subject: "Email Verification",
    text: "Please click the following link to verify your email: http://your-website.com/verify-email",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// Route to handle email verification
router.get("/verify-email", async (req, res) => {
  try {
    const email = req.query.email;
    // Find the user by email and update their emailVerified status to true
    await User.findOneAndUpdate({ email: email }, { emailVerified: true });
    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/getuser", async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.findOne({ username });
    if (user) {
      delete user.password;
      res.json(user);
    }
  } catch (error) {
    res.status(404).json({ message: "User not found", error: error.message });
  }
});

module.exports = router;
