const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userData");
const News = require("../models/news");
const verifyToken = require("../middleware/verifyToken");
const jwt = require("jsonwebtoken");

router.get("/api/news/unread", verifyToken, async (req, res) => {
  const page = parseInt(req.body.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;
    let user = await User.findOne({ username });
    const excludeIds = user.readNews.map((news) => news._id);

    const news = await News.find({ _id: { $nin: excludeIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.send(news);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get read news
router.get("/api/news/read", verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;
    let user = await User.findOne({ username }).populate({
      path: "readNews",
      options: {
        sort: { createdAt: -1 },
        skip: skip,
        limit: limit,
      },
    });
    res.send(user.readNews);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Mark news as read
router.post("/api/news/markAsRead", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "your-secret-key");
    const username = decodedToken.username;
    const { newsId } = req.body;
    let user = await User.findOne({ username });

    if (!user.readNews.includes(newsId)) {
      user.readNews.push(newsId);
      await user.save();
    }

    res.send({ message: "News marked as read" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.delete("/api/news/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await News.findByIdAndDelete(id);
    res.status(200).send({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error deleting article", error });
  }
});

router.put("/api/news/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedArticle = req.body;
    console.log(updatedArticle);
    const article = await News.findByIdAndUpdate(id, updatedArticle, {
      new: true,
    });
    res.status(200).send(article);
  } catch (error) {
    res.status(500).send({ message: "Error updating article", error });
  }
});

module.exports = router;
