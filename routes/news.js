const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userData");
const News = require("../models/news");

// Endpoint to fetch unread news or read news if no unread articles
router.get("/unread", async (req, res) => {
  const username = req.query.username;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const user = await User.findOne({ username }).populate("readArticles");
    if (!user) {
      return res.status(404).send("User not found");
    }
    console.log(user);
    const readArticleIds = user.readArticles.map((article) => article._id);

    let news = await News.find({ _id: { $nin: readArticleIds } })
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (news.length === 0) {
      // If no unread articles, fetch read articles
      news = await News.find({ _id: { $in: readArticleIds } })
        .sort({ date: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      if (news.length === 0) {
        return res.status(200).send({ message: "No articles available" });
      }
    }

    res.send(news);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Endpoint to fetch read news
router.get("/read", async (req, res) => {
  const username = req.query.username;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const user = await User.findOne({ username }).populate({
      path: "readArticles",
      options: {
        sort: { date: -1 },
        skip: (page - 1) * pageSize,
        limit: pageSize,
      },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user.readArticles);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Endpoint to mark articles as read
router.post("/markRead", async (req, res) => {
  console.log("mark read");
  const username = req.query.username;
  const articleIds = req.query.articleIds;
  console.log(username);
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.readArticles = [...new Set([...user.readArticles, ...articleIds])];
    await user.save();

    res.status(200).send("Articles marked as read");
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
