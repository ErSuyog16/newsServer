let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();
const jwt = require("jsonwebtoken");
const revokedTokens = new Set();

// const revokedTokens = require("../data/tokens");
// Student Model
let testData = require("../models/test");

console.log("Test Route executed");
// router.route("/test").get(async (req, res, next) => {
//   try {
//     const students = await testData.find(); // Retrieve all documents from the Student collection
//     // console.log("hello");
//     // console.log(students);
//     res.json(students); // Send the retrieved data as JSON response
//   } catch (error) {
//     // Handle errors appropriately
//     console.error("Error retrieving data from MongoDB:", error);
//     next(createError(500, "Internal Server Error")); // Pass the error to the error handling middleware
//   }
// });
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

function isTokenRevoked(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    console.log(authHeader);
    const token = authHeader.split(" ")[1];
    if (revokedTokens.has(token)) {
      return res.status(401).json({ message: "Token has been revoked" });
    }
    next();
  } else {
    res.status(401).json({ message: "Token is missing" });
  }
}

// Function to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  console.log(token);

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    // If token is valid, save decoded username to request object
    req.username = decoded.username;
    next();
  });
}

module.exports = router;
