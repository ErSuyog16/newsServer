const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userData");
const revokedTokens = require("../data/tokens");

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
    const token = jwt.sign({ username: user.username }, "your-secret-key", {
      expiresIn: "1h",
    });

    // Return token to the client
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function isTokenRevoked(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (revokedTokens.has(token)) {
      return res.status(401).json({ message: "Token has been revoked" });
    }
    next();
  } else {
    res.status(401).json({ message: "Token is missing" });
  }
}

// Route to handle user logout
router.post("/logout", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      revokedTokens.add(token); // Add the token to the set of revoked tokens4
      // Assuming you have a set named revokedTokens
      // Assuming you have a set named revokedTokens
      for (const token of revokedTokens) {
        console.log(token);
      }

      res.status(200).json({ message: "User logged out successfully" });
    } else {
      res.status(401).json({ message: "Token is missing" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
