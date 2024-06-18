const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userData");
// const revokedTokens = require("../data/tokens");
// const revokedTokens = new Set();

// Route to handle user login
router.post("/login", async (req, res) => {
  console.log("login", req.body);
  try {
    const { username, password } = req.body;

    // Find the user by username

    const user = await User.findOne({ username });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(user.password, hashedPassword);
    // Compare provided password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match, return error
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    // const token = jwt.sign({ username: user.username }, "your-secret-key", {
    //   expiresIn: "36h",
    // });

       const token = jwt.sign({ username: user.username }, "your-secret-key");
    const decodedToken = jwt.verify(token, "your-secret-key");

    // Extract the username from the decoded token
    const un = decodedToken.username;

    console.log("Username:", un);
    // Add the token to the user's list of tokens
    user.tokens.push(token);
    await user.save();

    // Return token to the client
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/logout", async (req, res) => {
 
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (authHeader) {
      const decodedToken = jwt.verify(authHeader, "your-secret-key");

      console.log(decodedToken.username); // Verify the token
      const user = await User.findOne({ username: decodedToken.username });
      console.log(user);
    //   console.log(user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove the token from the user's list of tokens
      user.tokens = user.tokens.filter((t) => t !== authHeader);
      await user.save();

      res.status(200).json({ message: "User logged out successfully" });
    } else {
      res.status(401).json({ message: "Token is missing" });
    }
  } catch (error) {
    // If token is invalid or expired, handle the error
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
