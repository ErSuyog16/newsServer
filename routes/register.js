const express = require("express");
const router = express.Router();
const User = require("../models/userData");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { route } = require("./user.route");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

console.log("regiter routes: ");

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
        "User registered successfully. ",
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

router.get("/getuser", verifyToken, async (req, res) => {
  console.log("hello");
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }
    decodedToken = jwt.verify(token, "your-secret-key");
    console.log(decodedToken.username, "USername");
    const username = decodedToken.username;
    const user = await User.findOne({ username });
    if (user) {
      // const { password, tokens, ...userWithoutSensitiveInfo } = user;
      user.password = "NA";
      user.tokens = "NA";

      res.send(user);
    }
  } catch (error) {
    res.status(404).json({ message: "User not found", error: error.message });
  }
});

async function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  console.log(token, "TOken from verify token");

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  let decodedToken = null;
  try {
    decodedToken = jwt.verify(token, "your-secret-key");
    console.log(decodedToken.username, "from verify token");

    const user = await User.findOne({ username: decodedToken.username });
    console.log(user.email, "email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tokens = user.tokens;
    console.log(tokens);
    let tokenFound = false;

    // Loop through the tokens array
    for (let i = 0; i < tokens.length; i++) {
      console.log(tokens[i], token);
      if (tokens[i] === token) {
        // Token found, set flag and break out of loop
        tokenFound = true;
        break;
      }
    }
    if (tokenFound) {
      req.username = decodedToken.username;
      next();
    } else {
      res.status(401).json({ message: "login with valid account" });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Failed to authenticate token" });
  }
}
module.exports = router;
