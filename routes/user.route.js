let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();

// Student Model
let newsAdmin = require("../models/news");

// CREATE Student
router.route("/create").post((req, res, next) => {
  console.log(req.body,"form has requested");
  newsAdmin.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

module.exports = router;
