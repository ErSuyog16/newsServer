const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userData");
const verifyToken = require("../middleware/verifyToken");

router.put("/update", verifyToken, async (req, res) => {
//   console.log(req.body);
  const updates = Object.keys(req.body);
  console.log(updates);
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    updates.forEach((update) => {
      if (update === "password") {
        user[update] = bcrypt.hashSync(req.body[update], 8);
      } else {
        user[update] = req.body[update];
      }
    });

    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
module.exports = router;
