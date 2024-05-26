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

router.post("/bookmarks/add", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const articleId = req.body.articleId;
    if (!articleId) {
      return res.status(400).send({ error: "Article ID is required" });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).send({ error: "Article not found" });
    }

    if (!user.bookmarks.includes(articleId)) {
      user.bookmarks.push(articleId);
      await user.save();
    }

    res.send(user.bookmarks);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Remove a bookmark
router.delete("/bookmarks/remove", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const articleId = req.body.articleId;

    // Log for debugging
    console.log(`Removing bookmark with article ID: ${articleId}`);

    const initialBookmarkCount = user.bookmarks.length;

    // Filter out the bookmark to be removed
    user.bookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.toString() !== articleId
    );

    // Check if the bookmark was actually removed
    if (user.bookmarks.length === initialBookmarkCount) {
      return res.status(404).send({ error: "Bookmark not found" });
    }

    await user.save();

    res.send(user.bookmarks);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get user's bookmarks
router.get("/bookmarks/getBookmarks", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;
    let user = await User.findOne({ username }).populate("bookmarks");

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send(user.bookmarks);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
module.exports = router;
