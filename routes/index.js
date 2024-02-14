require("dotenv").config({ path: "./.env" });
var express = require("express");
var router = express.Router();
const { pool } = require("../db/db");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../db/db.js");
const checkLoggedIn = require("../middlewares/checkloggedin.js");

/* GET home page. */
router.get("/", checkLoggedIn, function (req, res, next) {
  // console.log("----------------->", req.session.user);
  res.render("index", { title: "Express", user: req.session.user });
});

/* GET cart page. */
router.get("/auth", function (req, res, next) {
  res.render("authPage", {
    title: "Welcome to nafscare",
    user: req.session.user,
  });
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
    res.redirect("/");
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
  res.render("shop", { title: "shop", user: req.session.user });
});

/* GET Checkout page. */
router.get("/checkout", function (req, res, next) {
  res.render("checkout", { title: "checkout", user: req.session.user });
});

/* GET MyAccount page. */
router.get("/account", function (req, res, next) {
  console.log(req.session.user);
  res.render("myAccount", { title: "MyAccount", user: req.session.user });
});

/* GET cart page. */
router.get("/cart", checkLoggedIn, function (req, res, next) {
  res.render("cart", { title: "myCart", user: req.session.user });
});

//  POST UPDATE ADDRESS

router.post("/updateAddress", checkLoggedIn, async (req, res, next) => {
  try {
    const { addressLine1, addressLine2, contact, city, state, zipcode } =
      req.body;
    const userId = req.session.user.id;

    // Check if the user already has an address
    const [existingAddress] = await pool.execute(
      "SELECT * FROM customers WHERE id = ?",
      [userId]
    );

    if (existingAddress.length === 0) {
      // Insert new address if no existing address
      const insertQuery =
        "INSERT INTO customers (id, addressLine1, addressLine2, contact, city, state, zipcode) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await pool.execute(insertQuery, [
        userId,
        addressLine1,
        addressLine2,
        contact,
        city,
        state,
        zipcode,
      ]);
    } else {
      // Update existing address
      const updateQuery =
        "UPDATE customers SET addressLine1 = ?, addressLine2 = ?, contact = ?, city = ?, state = ?, zipcode = ? WHERE id = ?";
      await pool.execute(updateQuery, [
        addressLine1,
        addressLine2,
        contact,
        city,
        state,
        zipcode,
        userId,
      ]);
    }

    return res.send("<script>alert(`UPDATED SUCCESSFULLY`)</script>"); // Respond with JavaScript alert after updating or inserting address
  } catch (error) {
    console.error("Error updating or inserting address:", error);
    return res
      .status(500)
      .json({ message: "Error updating or inserting address" });
  }
});
//  POST ACCOUNT DETAILS

router.post("/updateAccountDetails", checkLoggedIn, async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.session.user.id;

    // Check if the user already has an account
    const [existingName] = await pool.execute(
      "SELECT * FROM customers WHERE id = ?",
      [userId]
    );

    if (existingName.length === 0) {
      // Insert new account details if no existing account
      const insertQuery =
        "INSERT INTO customers (id, name, email, phone) VALUES (?, ?, ?, ?)";
      await pool.execute(insertQuery, [userId, name, email, phone]);
    } else {
      // Update existing account details
      const updateQuery =
        "UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?";
      await pool.execute(updateQuery, [name, email, phone, userId]);
    }

    return res.send("<script>alert(`UPDATED SUCCESSFULLY`)</script>"); // Respond with JavaScript alert after updating or inserting details
  } catch (error) {
    console.error("Error updating or inserting details:", error);
    return res
      .status(500)
      .json({ message: "Error updating or inserting details" });
  }
});

router.post("/updatePassword", checkLoggedIn, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    // Check if the new password matches the confirm password
    if (newPassword !== confirmPassword) {
      return res.send(
        `<script> alert("New password and confirm password do not match") </script>`
      );
    }

    // Fetch the user's current password from the database
    const [userData] = await pool.execute(
      "SELECT password FROM customers WHERE id = ?",
      [userId]
    );

    if (userData.length === 0) {
      return res.send(`<script> alert("User not found!") </script>`);
    }

    const userPassword = userData[0].password;

    // Compare the current password provided by the user with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(currentPassword, userPassword);

    if (!isPasswordValid) {
      return res.send(
        `<script> alert("Current password is incorrect") </script>`
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const updateQuery = "UPDATE customers SET password = ? WHERE id = ?";
    await pool.execute(updateQuery, [hashedNewPassword, userId]);

    return res.send("<script>alert(`Password updated successfully`)</script>"); // Respond with JavaScript alert after updating password
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Error updating password" });
  }
});

/* GET Product page. */
router.get("/product", function (req, res, next) {
  // console.log("----------------->", req.session.user);
  res.render("productPage", { title: "product", user: req.session.user });
});

module.exports = router;
