// const express = require("express");
let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const User = require("../models/userData");
const Article = require("../models/news");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");

router.post("/category/add", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const category = req.body.category;
    if (!category) {
      return res.status(400).send({ error: "category is required" });
    }

    // const article = await Article.findById(articleId);
    // if (!article) {
    //   return res.status(404).send({ error: "Article not found" });
    // }

    if (!user.categories.includes(category)) {
      user.categories.push(category);
      await user.save();
    }

    res.send(user.categories);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Remove a bookmark
router.delete("/category/remove", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const category = req.body.category;

    // Log for debugging
    console.log(`Removing bookmark with category : ${category}`);

    const initialCategoriesCount = user.categories.length;

    // Filter out the bookmark to be removed
    user.categories = user.categories.filter(
      (cat) => cat.toString() !== category
    );

    // Check if the bookmark was actually removed
    if (user.categories.length === initialCategoriesCount) {
      return res.status(404).send({ error: "category not found" });
    }

    await user.save();

    res.send(user.categories);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get user's bookmarks
router.get("/category/getCategory", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;

    let user = await User.findOne({ username });

    console.log(user.categories);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    console.log(user.categories);

    res.send(user.categories);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
module.exports = router;
