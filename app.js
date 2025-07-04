require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser"); 

const Blog = require("./models/blog");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

mongoose
.connect(process.env.MONGODB_URL)
.then(() => {
  console.log(" MongoDB Connected");



  app.set("view engine", "ejs");
  app.set("views", path.resolve("./views"));

  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser()); 
  app.use(checkForAuthenticationCookie("token"));
  app.use(express.static(path.resolve("./public")));

 app.use(session({
  secret: process.env.EXPRESS_SESSION, 
  resave: false,
  saveUninitialized: false,
}));

app.use(flash());


app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

  
  app.get("/", async (req, res) => {
    try {
      const allBlogs = await Blog.find({});
      res.render("home", {
        user: req.user,
        blogs: allBlogs,
     
      });
    } catch (err) {
      console.error("Error fetching blogs:", err.message);
      res.status(500).send("Error loading homepage.");
    }
  });

  app.use("/user", userRoute);
  app.use("/blog", blogRoute);

  app.listen(PORT, () =>
    console.log(`Server Started at http://localhost:${PORT}`)
  );

})
.catch((err) => {
  console.error("MongoDB Connection Failed:", err.message);
});
