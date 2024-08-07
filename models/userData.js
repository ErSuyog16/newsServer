const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    country: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    organisation: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    readNews: [{ type: mongoose.Schema.Types.ObjectId, ref: "News" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "News" }],
    categories: [{ type: String }],
    tokens: [
      {
        type: String, // Assuming tokens are stored as strings
      },
    ],
    isVerified: {
      type: Boolean,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    collection: "Users",
  }
);

module.exports = mongoose.model("User", userSchema);
