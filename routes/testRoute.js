let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userData");

// const revokedTokens = require("../data/tokens");
// Student Model
let testData = require("../models/test");

console.log("Test Route executed");
router.get("/test", verifyToken, async (req, res) => {
  console.log(req.headers.Accept);
  try {
    const students = await testData.find(); // Retrieve all documents from the Student collection
    // console.log("hello");
    // console.log(students);
    res.json(students); // Send the retrieved data as JSON response
  } catch (error) {
    // Handle errors appropriately
    console.error("Error retrieving data from MongoDB:", error);
    next(createError(500, "Internal Server Error")); // Pass the error to the error handling middleware
  }
  // res.status(200).json({ message: "You have accessed the test route" });
});

// Function to verify JWT token
async function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  console.log(token);
  console.log("HELLO hii");
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  let decodedToken = null;
  try {
    decodedToken = jwt.verify(token, "your-secret-key");
   

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
  // jwt.verify(token, "your-secret-key", (err, decodedToken) => {
  //   if (err) {
  //     return res.status(401).json({ message: "Failed to authenticate token" });
  //   }

  //   const user = User.findOne({ username: decodedToken.username });
  //   console.log(user);
  //   if (!user) {
  //     return res.status(404).json({ message: "User not found" });
  //   }

  //   const tokenExists = user.tokens.some((t) => t.accessToken === token);
  //   if (tokenExists) {
  //     req.username = decoded.username;
  //     next();
  //   } else {
  //     res.status(401).json({ message: "login with valid account" });
  //   }
  // });
}

module.exports = router;
