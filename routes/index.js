require("dotenv").config({ path: "./.env" });
var express = require("express");
var router = express.Router();
const { pool } = require("../db/db");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../db/db.js");
const checkLoggedIn = require("../middlewares/checkloggedin.js");
const { sendmail } = require("../middlewares/mail.js");
const { forgetMail } = require("../middlewares/forgetMail.js");

var ip = require("ip");

/* GET home page. */

router.get("/", function (req, res, next) {
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
    sendmail(req, res, email, name);
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
    return res.send("<script>alert(`USER NOT FOUND!``)</script>");
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

// /* GET Checkout page. */
// router.get("/checkout", function (req, res, next) {
//   res.render("checkout", { title: "checkout", user: req.session.user });
// });

/* GET MyAccount page. */
router.get("/account", checkLoggedIn, async function (req, res, next) {
  try {
    // Fetch orders data from the orders table
    const [ordersRows] = await pool.execute(
      "SELECT * FROM orders WHERE userId = ?",
      [req.session.user.id]
    );

    console.log(ordersRows);

    if (ordersRows.length === 0) {
      return res.render("myAccount", {
        title: "MyAccount",
        user: req.session.user,
        orders: [],
      });
    }

    // Render the "myAccount" page with the orders data
    res.render("myAccount", {
      title: "MyAccount",
      user: req.session.user,
      orders: ordersRows,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/* GET cart page. */

router.get("/cart", async function (req, res, next) {
  const userIp = ip.address();

  try {
    // Fetch cart items for the user's IP address
    const [cartRows, fields] = await pool.execute(
      "SELECT id, pid, vid, qty FROM cart WHERE ipadd = ?",
      [userIp]
    );

    // console.log("==============>", cartRows);

    //  const [rows, fields] = await pool.execute(
    //    "SELECT price FROM provar WHERE pid = ? AND vid = ?",
    //    [pid, vid]
    //  );

    if (cartRows.length === 0) {
      return res.render("cart", {
        title: "myCart",
        user: req.session.user,
        products: [],
      });
    }

    // Prepare arrays to store product IDs and variant IDs for fetching product details
    const productIds = [];
    const variantIds = [];
    const quantities = {};

    // Extract product IDs, variant IDs, and quantities from the cartRows
    cartRows.forEach((row) => {
      productIds.push(row.pid);
      variantIds.push(row.vid);
      quantities[`${row.pid}_${row.vid}`] = row.qty;
    });

    // Generate comma-separated list of product IDs and variant IDs
    const productIdList = productIds.join(",");
    const variantIdList = variantIds.join(",");

    // console.log("======================>", productIdList);
    // Fetch product details from product table
    const [productRows] = await pool.execute(
      `SELECT id, name, description, image1, image2 FROM product WHERE id IN (${productIdList})`
    );

    // Fetch individual prices from provar table
    const [priceRows] = await pool.execute(
      `SELECT pid, vid, price FROM provar WHERE pid IN (${productIdList}) AND vid IN (${variantIdList})`
    );

    // Construct the response object with product details and individual prices
    const products = productRows.map((product) => {
      const variantId = variantIds[productIds.indexOf(product.id)]; // Get variant ID for the current product
      const quantity = quantities[`${product.id}_${variantId}`] || 0; // Get quantity for the current product variant
      const price =
        priceRows.find(
          (priceRow) =>
            priceRow.pid === product.id && priceRow.vid === variantId
        )?.price || 0; // Get individual price for the current product variant
      return {
        pid: product.id,
        vid: variantId,
        name: product.name,
        description: product.description,
        image1: product.image1,
        image2: product.image2,
        quantity: quantity,
        individualPrice: price,
      };
    });

    console.log("==============>", products);

    // Render the cart page with product details
    res.render("cart", {
      title: "myCart",
      user: req.session.user,
      products: products,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/clearCart", (req, res, next) => {
  pool.execute("DELETE FROM cart");
  res.redirect("/cart");
});

router.post("/addCart", async (req, res) => {
  // const { pid, qty, vid } = req.body;
  const pid = 5;
  const vid = 2;
  const qty = 2;
  const ipAdd = ip.address();

  try {
    // Check if the combination of pid and vid already exists in the cart
    const [existingRows] = await pool.execute(
      "SELECT * FROM cart WHERE ipadd = ? AND pid = ? AND vid = ?",
      [ipAdd, pid, vid]
    );

    if (existingRows.length > 0) {
      // If the combination of pid and vid already exists, return a message
      return res.send(
        "<script> alert('Item already exists in the cart') </script>"
      );
    }

    // Fetch price from provar table based on pid and vid
    const [rows, fields] = await pool.execute(
      "SELECT price FROM provar WHERE pid = ? AND vid = ?",
      [pid, vid]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product variant not found." });
    }

    const price = rows[0].price * qty;

    // Insert into cart table
    await pool.query(
      "INSERT INTO cart (ipadd, pid, vid, qty, price) VALUES (?, ?, ?, ?, ?)",
      [ipAdd, pid, vid, qty, price]
    );

    res.redirect("/cart");
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
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

  const productId = 5;

  if(req.session.user){
  const userId = req.session.user.id;

  // Check if the user has purchased the product but has not reviewed it
  pool
    .execute(
      "SELECT * FROM orders WHERE userId = ? AND pid = ? AND reviewed = 0",
      [userId, productId]
    )
    .then(([orderRows]) => {
      console.log("===================>", orderRows);

      if (orderRows.length > 0) {
        res.render("productPage", {
          title: "Product Page",
          user: req.session.user,
          reviewFormVisible: true,
        });
      } else {
        res.render("productPage", {
          title: "Product Page",
          user: req.session.user,
          reviewFormVisible: false,
        });
      }
      
    })
    .catch((error) => {
      console.error("Error executing query:", error);
      // Handle the error appropriately
    });
  }else{
     res.render("productPage", {
          title: "Product Page",
          user: null,
          reviewFormVisible: false,
        })
  }
});

// -------------------- checkout route -----------------------

router.get("/checkout", checkLoggedIn, async (req, res, next) => {
  const userIp = ip.address();

  try {
    // Fetch cart items for the user's IP address
    const [cartRows, fields] = await pool.execute(
      "SELECT id, pid, vid, qty FROM cart WHERE ipadd = ?",
      [userIp]
    );

    //  const [rows, fields] = await pool.execute(
    //    "SELECT price FROM provar WHERE pid = ? AND vid = ?",
    //    [pid, vid]
    //  );

    // Prepare arrays to store product IDs and variant IDs for fetching product details
    const productIds = [];
    const variantIds = [];
    const quantities = {};

    // Extract product IDs, variant IDs, and quantities from the cartRows
    cartRows.forEach((row) => {
      productIds.push(row.pid);
      variantIds.push(row.vid);
      quantities[`${row.pid}_${row.vid}`] = row.qty;
    });

    // Generate comma-separated list of product IDs and variant IDs
    const productIdList = productIds.join(",");
    const variantIdList = variantIds.join(",");

    // Fetch product details from product table
    const [productRows] = await pool.execute(
      `SELECT id, name, description, image1, image2 FROM product WHERE id IN (${productIdList})`
    );

    // Fetch individual prices from provar table
    const [priceRows] = await pool.execute(
      `SELECT pid, vid, price FROM provar WHERE pid IN (${productIdList}) AND vid IN (${variantIdList})`
    );

    // Construct the response object with product details and individual prices
    const products = productRows.map((product) => {
      const variantId = variantIds[productIds.indexOf(product.id)]; // Get variant ID for the current product
      const quantity = quantities[`${product.id}_${variantId}`] || 0; // Get quantity for the current product variant
      const price =
        priceRows.find(
          (priceRow) =>
            priceRow.pid === product.id && priceRow.vid === variantId
        )?.price || 0; // Get individual price for the current product variant
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        image1: product.image1,
        image2: product.image2,
        quantity: quantity,
        individualPrice: price,
      };
    });

    // Render the checkout page with product details
    res.render("checkout", {
      title: "checkout",
      user: req.session.user,
      products: products,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/cod", async (req, res, next) => {
  const userIp = ip.address();

  try {
    // Fetch cart items for the user's IP address
    const [cartRows, fields] = await pool.execute(
      "SELECT id, pid, vid, qty FROM cart WHERE ipadd = ?",
      [userIp]
    );

    //  const [rows, fields] = await pool.execute(
    //    "SELECT price FROM provar WHERE pid = ? AND vid = ?",
    //    [pid, vid]
    //  );

    // Prepare arrays to store product IDs and variant IDs for fetching product details
    const productIds = [];
    const variantIds = [];
    const quantities = {};

    // Extract product IDs, variant IDs, and quantities from the cartRows
    cartRows.forEach((row) => {
      productIds.push(row.pid);
      variantIds.push(row.vid);
      quantities[`${row.pid}_${row.vid}`] = row.qty;
    });

    // Generate comma-separated list of product IDs and variant IDs
    const productIdList = productIds.join(",");
    const variantIdList = variantIds.join(",");

    // Fetch product details from product table
    const [productRows] = await pool.execute(
      `SELECT id, name, description, image1, image2 FROM product WHERE id IN (${productIdList})`
    );

    // Fetch individual prices from provar table
    const [priceRows] = await pool.execute(
      `SELECT pid, vid, price FROM provar WHERE pid IN (${productIdList}) AND vid IN (${variantIdList})`
    );

    // Construct the response object with product details and individual prices
    const products = productRows.map((product) => {
      const variantId = variantIds[productIds.indexOf(product.id)]; // Get variant ID for the current product
      const quantity = quantities[`${product.id}_${variantId}`] || 0; // Get quantity for the current product variant
      const price =
        priceRows.find(
          (priceRow) =>
            priceRow.pid === product.id && priceRow.vid === variantId
        )?.price || 0; // Get individual price for the current product variant
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        image1: product.image1,
        image2: product.image2,
        quantity: quantity,
        individualPrice: price,
      };
    });

    for (const product of products) {
      const [rows, fields] = await pool.execute(
        "SELECT orderId FROM orders ORDER BY id DESC LIMIT 1"
      );

      let lastOrderId = 0;
      if (rows.length > 0) {
        lastOrderId = parseInt(rows[0].orderId);
      }

      const orderId = lastOrderId + 1;
      console.log("order id =======================>", orderId);
      let userId = req.session.user.id;
      let qty = product.quantity;
      let pid = product.id;
      let productName = product.name;
      let paymentType = "COD";
      let price = product.individualPrice * product.quantity;

      console.log(
        "===============>",
        orderId,
        userId,
        qty,
        pid,
        productName,
        paymentType,
        price
      );

      const Query =
        "INSERT INTO orders (orderId, userId, qty, pid, productName, paymentType, price) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await pool.execute(Query, [
        orderId,
        userId,
        qty,
        pid,
        productName,
        paymentType,
        price,
      ]);

      const updateQuery =
        "UPDATE orders SET reviewed = ? WHERE orderId = ? AND userId = ?";
      await pool.execute(updateQuery, [false, orderId, userId]);
    }

    pool.execute("DELETE FROM cart");
    res.redirect("/account");
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route to handle search query
router.get("/search/:q", async (req, res) => {
  const searchTerm = req.params.q; // Get search term from query parameter
  const Query = `SELECT * FROM product WHERE name LIKE '%${searchTerm}%' `;
  //
  const [results] = await pool.query(Query);
  console.log("====================>", results);
  res.json(results); // Send JSON response with search results
});

router.get("/removeCartItem/:pidVid", async (req, res, next) => {
  try {
    let pidVid = req.params.pidVid;
    console.log(pidVid);

    // Find the index of the "," sign
    let separatorIndex = pidVid.indexOf(",");

    if (separatorIndex !== -1) {
      // Check if the "," sign is found
      // Split the string into two parts based on the "," sign
      let pid = pidVid.substring(0, separatorIndex);
      let vid = pidVid.substring(separatorIndex + 1);

      const deleteQuery = `DELETE FROM cart WHERE pid = ? AND vid = ?`;
      await pool.execute(deleteQuery, [pid, vid]);

      res.redirect("/cart");
    }
  } catch (error) {
    return res.send(
      "<script>alert(`Error deleting product, please try again.`)</script>"
    );
  }
});

// GET forget password

router.get("/forget", async (req, res, next) => {
  try {
    res.render("forget", { title: "Forget Password", user: null });
  } catch (error) {
    return res.send(
      "<script>alert(`Error Rendering forget page, please try again.`)</script>"
    );
  }
});

// POST forget password

router.post("/forget", async (req, res, next) => {
  const { email } = req.body;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.send("<script>alert('USER NOT FOUND!');</script>");
    }
    const user = rows[0];
    console.log("==========>", user);

    forgetMail(req, res, user);
  } catch (error) {
    return res.send(
      `<script> alert('Something went wrong! please try again.') </script>`
    );
  }
});

// GET change password

router.get("/change-password/:id", async (req, res, next) => {
  const [rows] = await pool.execute("SELECT * FROM customers WHERE id = ?", [
    req.params.id,
  ]);
  const user = rows[0];

  if (user.passwordResetToken == 1) {
    const updateQuery =
      "UPDATE customers SET passwordResetToken = ? WHERE id = ?";
    await pool.execute(updateQuery, [0, user.id]);

    res.render("changePass", { title: "Change Password", user });
  } else {
    return res.send("<script>alert('LINK EXPIRED. TRY AGAIN');</script>");
  }
});

router.post("/change-password/:id", async (req, res, next) => {
  try {
    const { password } = req.body;

    // Insert user into database
    const hashedPassword = await bcrypt.hash(password, 10);

    const [rows] = await pool.execute("SELECT * FROM customers WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.send("<script>alert('USER NOT FOUND!');</script>");
    }
    const user = rows[0];

    const updateQuery = "UPDATE customers SET password = ? WHERE id = ?";

    await pool.execute(updateQuery, [hashedPassword, user.id]);

    res.send(`<script>alert('Password updated successsfully!')</script>`);
  } catch (error) {
    res.send(error);
  }
});

// Route to update quantities
router.post("/updateQty", async (req, res) => {
  const updatedQuantities = req.body;

  // Using Object.keys()
  const keys = Object.keys(updatedQuantities);
  keys.forEach((key) => {
    const productId = key.split("[")[1].split("-")[0]; // Extract productId from the key
    const variationId = key.split("-")[1].split("]")[0]; // Extract variationId from the key
    const quantity = updatedQuantities[key];

    const updateQuery = "UPDATE cart SET qty = ? WHERE pid = ? AND vid = ?";
    pool.execute(updateQuery, [quantity, productId, variationId]);
  });

  res.redirect("/cart"); // Redirect back to the cart page
});

module.exports = router;
