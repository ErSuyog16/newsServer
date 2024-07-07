const express = require("express");
const router = express.Router();
const User = require("../models/userData");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { route } = require("./user.route");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

console.log("regiter routes: ");

// Route to register a new user
// router.post("/register", async (req, res) => {
//   console.log(req.body);
//   try {
//     // Create a new user instance with the provided data
//     const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

//     const newUser = new User({
//       username: req.body.username,
//       fullName: req.body.fullName,
//       email: req.body.email,
//       phoneNumber: req.body.phoneNumber,
//       organisation: req.body.organisation,
//       gender: req.body.gender,
//       country: req.body.country,
//       password: hashedPassword,
//     });

//     const savedUser = await newUser.save();

//     res.status(200).json({
//       message: "User registered successfully. ",
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    // Create a new user instance with the provided data
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    console.log(verificationToken);
    const newUser = new User({
      username: req.body.username,
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      organisation: req.body.organisation,
      gender: req.body.gender,
      country: req.body.country,
      password: hashedPassword,
      verificationToken: verificationToken, // Add this field in your User schema
      isVerified: false, // Add this field in your User schema
    });
    console.log(newUser.verificationToken);
    const savedUser = await newUser.save();

    // Send verification email
    try {
      await sendVerificationEmail(savedUser, req);
      res.status(200).json({
        message:
          "User registered successfully. Please check your email for verification.",
      });
    } catch (emailError) {
      console.error(emailError);
      res.status(500).json({ message: "Error sending verification email" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Function to send verification email
const sendVerificationEmail = async (user, req) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or any other email service
    auth: {
      user: "u20cs107@coed.svnit.ac.in", // your email
      pass: "@Suyog123.", // your email password
    },
  });

  const mailOptions = {
    from: "u20cs107@coed.svnit.ac.in",
    to: user.email,
    subject: "Account Verification",
    text: `Please verify your account by clicking the link: \nhttp://${req.headers.host}/users/verify/${user.verificationToken}`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};

router.get("/verify/:token", async (req, res) => {
  console.log("GET /verify");
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
// router.put("/update", verifyToken, async (req, res) => {
//   const updates = Object.keys(req.body);
//   const allowedUpdates = [
//     "username",
//     "fullName",
//     "email",
//     "country",
//     "phoneNumber",
//     "organisation",
//     "password",
//   ];
//   const isValidOperation = updates.every((update) =>
//     allowedUpdates.includes(update)
//   );

//   if (!isValidOperation) {
//     return res.status(400).send({ error: "Invalid updates!" });
//   }

//   try {
//     // Check if the username already exists if it's being updated
//     if (updates.includes("username")) {
//       const existingUser = await User.findOne({ username: req.body.username });
//       if (
//         existingUser &&
//         existingUser._id.toString() !== req.user._id.toString()
//       ) {
//         return res.status(400).send({ message: "Username already exists" });
//       }
//     }
//     console.log(req.body);
//     const token = req.headers.authorization;
//     decodedToken = jwt.verify(token, "your-secret-key");
//     console.log(decodedToken.username, "USername");
//     const username = decodedToken.username;
//     let user = await User.findOne({ username });

//     updates.forEach((update) => (user[update] = req.body[update]));

//     if (updates.includes("password")) {
//       user.password = await bcrypt.hash(req.user.password, 8);
//     }

//     await user.save();
//     res.send(req.user);
//   } catch (error) {
//     res.status(400).send({ error: error.message });
//   }
// });

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
