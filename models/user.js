const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let newsAdmin = new Schema(
  {
    Title: {
      type: String,
    },
    ImageUrl: {
      type: String,
    },
    Description: {
      type: String,
    },
    ReadMoreUrl: {
      type: String,
    },
    ReadMoreText: {
      type: String,
    },
    formDate: {
      type: Date,
    },
    formTime: {
      type: Date,
    },
  },
  {
    collection: "NewsIntern",
  }
);

module.exports = mongoose.model("News", newsAdmin);
