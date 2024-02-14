require("dotenv").config({ path: "./.env" });
var express = require("express");
var router = express.Router();
const { pool } = require("../db/db");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../db/db.js");
const checkLoggedIn = require("../middlewares/checkloggedin.js");

/* GET home page. */
router.get("/",checkLoggedIn, function (req, res, next) {
  console.log("----------------->", req.session.user);
  res.render("index", { title: "Express" });
});

/* GET cart page. */
router.get("/auth", function (req, res, next) {
  res.render("authPage", { title: "Welcome to nafscare" });
});

// POST SIGN-UP

// router.post("/signup", async (req, res, next) => {
//   const { name, email, phone, password } = req.body;
//   // Check if all fields are provided
//   if (!name || !email || !phone || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     // Insert user into database
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const Query =
//       "INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)";
//     const [result] = await pool.execute(Query, [
//       name,
//       email,
//       phone,
//       hashedPassword,
//     ]);

//     // const userId = result.insertId;

//     // // Generate tokens
//     // const accessToken = generateAccessToken({ _id: userId, name, email });
//     // const refreshToken = generateRefreshToken({ _id: userId });

//     // // Update user record with tokens
//     // const updateQuery =
//     //   "UPDATE customers SET accessToken = ?, refreshToken = ? WHERE id = ?";
//     // await pool.execute(updateQuery, [accessToken, refreshToken, userId]);

//     console.log("Registration successful");
//     res.redirect("/auth");
//   } catch (error) {
//     console.error("Error registering user:", error);
//     return res.status(500).json({ message: "Error registering user" });
//   }
// });
router.post("/signup", async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  // Check if all fields are provided
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the email already exists in the database
    const [emailRows] = await pool.query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    // Check if the phone number already exists in the database
    const [phoneRows] = await pool.query(
      "SELECT * FROM customers WHERE phone = ?",
      [phone]
    );

    // If email or phone number already exists, return error
    if (emailRows.length > 0) {
      return res.send("<script>alert('Email already exists');</script>");
    }

    if (phoneRows.length > 0) {
      return res.send("<script>alert('Phone number already exists');</script>");
    }

    // Insert user into database
    const hashedPassword = await bcrypt.hash(password, 10);

    const Query =
      "INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)";
    const [result] = await pool.execute(Query, [
      name,
      email,
      phone,
      hashedPassword,
    ]);

    // const userId = result.insertId;

    // // Generate tokens
    // const accessToken = generateAccessToken({ _id: userId, name, email });
    // const refreshToken = generateRefreshToken({ _id: userId });

    // // Update user record with tokens
    // const updateQuery =
    //   "UPDATE customers SET accessToken = ?, refreshToken = ? WHERE id = ?";
    // await pool.execute(updateQuery, [accessToken, refreshToken, userId]);

    console.log("Registration successful");
    res.redirect("/auth");
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Error registering user" });
  }
});



// POST SIGN-IN

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password are provided
  if (!email || !password) {
    return alert("USER NOT FOUND!");
  }

  try {
    // Check if the user exists in the database
    const [rows] = await pool.execute(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.send("<script>alert('USER NOT FOUND!');</script>");
    }

    const user = rows[0];

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.send("<script>alert('INVALID PASSWORD');</script>");
     
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update user record with tokens
    const updateQuery =
      "UPDATE customers SET accessToken = ?, refreshToken = ? WHERE id = ?";
    await pool.execute(updateQuery, [accessToken, refreshToken, user.id]);

    // Return tokens to the client
    // console.log({ accessToken, refreshToken }, "From Login route");

    // Store user data in session
    req.session.user = user;
    res.redirect("/")
  } catch (error) {
    console.error("Error logging in:", error);
      return res.send("<script>alert('Error logging in');</script>");

   
  }
});

// Logout route

router.get("/logout", async (req, res) => {
  try {
    // Get the user ID from the session
    const userId = req.session.user.id; // Assuming the user ID is stored in the session

    // Update the user record in the database to remove the refresh token and access token
    const updateQuery =
      "UPDATE customers SET refreshToken = NULL, accessToken = NULL WHERE id = ?";
    await pool.query(updateQuery, [userId]);

    // Clear the session and cookies
    req.session.destroy(); // Destroy the session
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    console.log({ message: "Logout successful" });
    res.redirect("/auth");
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Error logging out" });
  }
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
