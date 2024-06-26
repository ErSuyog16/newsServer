let express = require("express");
let mongoose = require("mongoose");
let cors = require("cors");
let bodyParser = require("body-parser");
let dbConfig = require("./database/db");

const createError = require("http-errors");
// Express Route
const studentRoute = require("./routes/user.route");
const testRoute = require("./routes/testRoute");
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const newsRoutes = require("./routes/news");
const updateRoute = require("./routes/update");
const categoryRoute = require("./routes/category");
let newsAdmin = require("./models/news");
let bookmarkRoute = require("./routes/bookmark");
// Connecting mongoDB Database
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db, {
    useNewUrlParser: true,
  })
  .then(
    () => {
      console.log("Database sucessfully connected!");
    },
    (error) => {
      console.log("Could not connect to database : " + error);
    }
  );

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
console.log("hii");
app.use(cors());
app.use("/users", studentRoute);
app.use("/", testRoute);
app.use("/users", registerRoute);
app.use("/users", loginRoute);
app.use("/", newsRoutes);
app.use("/users", bookmarkRoute);
app.use("/users", categoryRoute);
app.use("/users", updateRoute);

// app.get("/", async (req, res, next) => {
//   try {
//     const { category } = req.query; // Get the category from query parameters
//     const validCategories = [
//       "Leadership and Organizational Development",
//       "Strategic and Operations Management",
//       "Financial and Risk Management",
//       "Human Resources and Change Management",
//       "Innovation and Entrepreneurship",
//       "Marketing and Customer Relations",
//     ];

//     let query = {};
//     if (category) {
//       if (!validCategories.includes(category)) {
//         return res.status(400).json({ error: "Invalid category specified" });
//       }
//       query.Category = category; // Filter by the specified category
//     }
//     console.log(query);
//     const news = await newsAdmin.find(query); // Retrieve documents based on the query
//     news.reverse(); // Reverse the order of the news array

//     res.json(news); // Send the retrieved data as JSON response
//   } catch (error) {
//     console.error("Error retrieving data from MongoDB:", error);
//     next(createError(500, "Internal Server Error")); // Pass the error to the error handling middleware
//   }
// });

app.get("/", async (req, res, next) => {
  try {
    const categories = req.body.categories; // Get the categories from query parameters

    console.log(categories);
    let query = {};
    if (categories) {
      const categoryArray = Array.isArray(categories)
        ? categories
        : [categories];

      query.Category = { $in: categoryArray }; // Filter by the specified categories
    }

    console.log(query);
    const news = await newsAdmin.find(query); // Retrieve documents based on the query
    news.reverse(); // Reverse the order of the news array

    res.json(news); // Send the retrieved data as JSON response
  } catch (error) {
    console.error("Error retrieving data from MongoDB:", error);
    next(createError(500, "Internal Server Error")); // Pass the error to the error handling middleware
  }
});

// PORT
const port = process.env.PORT || 4001;
const server = app.listen(port, () => {
  console.log("Connected to port " + port);
});

// 404 Error
app.use((req, res, next) => {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
