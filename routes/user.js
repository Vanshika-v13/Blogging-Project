const { Router } = require("express");
const User = require("../models/user");

const router = Router();


router.get("/signin", (req, res) => {
  return res.render("signin");
});


router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
     req.flash("success", "Signed in successfully!");
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    req.flash("error", "Incorrect Email or Password");
    return res.redirect("/user/signin");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    await User.create({ fullName, email, password });


    req.flash("success", "Signup successful. You can now sign in.");

    return res.redirect("/user/signin");
  } catch (error) {
    if (error.code === 11000) {
      req.flash("error", "Email already exists. Please use a different one.");
    } else {
      req.flash("error", "Something went wrong. Please try again.");
    }

    
    return res.redirect("/user/signup");
  }
});


module.exports = router;
