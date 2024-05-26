const jwt = require("jsonwebtoken");
const User = require("../models/userData");

async function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  // console.log(token, "TOken from verify token");

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  let decodedToken = null;
  try {
    decodedToken = jwt.verify(token, "your-secret-key");
    // console.log(decodedToken.username, "from verify token");

    const user = await User.findOne({ username: decodedToken.username });
    // console.log(user.email, "email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tokens = user.tokens;
    // console.log(tokens);
    let tokenFound = false;

    // Loop through the tokens array
    for (let i = 0; i < tokens.length; i++) {
      // console.log(tokens[i], token);
      if (tokens[i] === token) {
        // Token found, set flag and break out of loop
        tokenFound = true;
        break;
      }
    }
    if (tokenFound) {
      req.username = decodedToken.username;
      next();
    } else {
      res.status(401).json({ message: "login with valid account" });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Failed to authenticate token" });
  }
}
module.exports = verifyToken;
