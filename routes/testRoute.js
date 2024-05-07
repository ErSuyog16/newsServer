let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();

// Student Model
let testData = require("../models/test");

console.log("TEST Route executed");
router.route("/test").get(async (req, res, next) => {
  try {
    const students = await testData.find(); // Retrieve all documents from the Student collection
    console.log("hello");
    console.log(students);
    res.json(students); // Send the retrieved data as JSON response
  } catch (error) {
    // Handle errors appropriately
    console.error("Error retrieving data from MongoDB:", error);
    next(createError(500, "Internal Server Error")); // Pass the error to the error handling middleware
  }
});

module.exports = router;
