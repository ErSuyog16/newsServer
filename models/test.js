const mongoose = require("mongoose");
const Schema = mongoose.Schema;
console.log("sschema ececuted");
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
    Category: {
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
    collection: "News",
  }
);

module.exports = mongoose.model("NewsTest", newsAdmin);
