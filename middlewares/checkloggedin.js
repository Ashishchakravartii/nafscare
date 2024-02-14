const { pool } = require("../db/db"); // Import the MySQL pool instance
var session = require("express-session");

// Middleware to check if user is logged in based on accessToken
async function checkLoggedIn(req, res, next) {
  try {
    // Check if user data exists in session
    if (!req.session.user) {
      return res.redirect("/auth");
    }

    // Retrieve user ID from session
    const userId = req.session.user.id;

    // Query the database to check if accessToken is present for the user
    const [rows] = await pool.execute(
      "SELECT accessToken FROM customers WHERE id = ?",
      [userId]
    );

    // Check if accessToken is present
    if (rows.length === 0 || !rows[0].accessToken) {
      return res.redirect("/auth");
    }

    // User is logged in, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error checking login status:", error);
    return res.status(500).json({ message: "Error checking login status" });
  }
}

module.exports = checkLoggedIn;
