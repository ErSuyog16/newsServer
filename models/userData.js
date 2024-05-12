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
    instituteName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified:{
        type: Boolean,
        
    }
  },
  {
    collection: "Users",
  }
);

module.exports = mongoose.model("User", userSchema);
