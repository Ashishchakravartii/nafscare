var express = require("express");
var router = express.Router();
const connection = require("../db/db.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* GET cart page. */
router.get("/auth", function (req, res, next) {
  res.render("authPage", { title: "Welcome to nafscare" });
});

// POST SIGN-UP

router.post("/signup", (req, res, next) => {
  const { name, email, phone, password} = req.body;
  // Check if all fields are provided
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if passwords match
  // if (password !== confirmPassword) {
  //   return res.status(400).json({ message: "Passwords do not match" });
  // }

  // Insert user into database
  const query =
    "INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)";
  connection.query(
    query,
    [name, email, phone, password],
    (error, results, fields) => {
      if (error) {
        console.error("Error registering user: " + error.stack);
        return res.status(500).json({ message: "Error registering user" });
      }

      res.redirect("/");
      // res.status(200).json({ message: "User registered successfully" });
      console.log("registration successfully");
    }
  );
});

/* GET Shop page. */
router.get("/shop", function (req, res, next) {
  res.render("shop", { title: "shop" });
});

/* GET Checkout page. */
router.get("/checkout", function (req, res, next) {
  res.render("checkout", { title: "checkout" });
});

/* GET MyAccount page. */
router.get("/account", function (req, res, next) {
  res.render("myAccount", { title: "MyAccount" });
});

/* GET cart page. */
router.get("/cart", function (req, res, next) {
  res.render("cart", { title: "myCart" });
});

module.exports = router;
