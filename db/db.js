const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

// MySQL Connection
// const connection = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "nafscare",
// });

// // Connect to MySQL
// (async () => {
//   try {
//     const connection = await connection.getConnection();
//     console.log("Connected to MySQL database successfully!");
//     connection.release(); // Release the connection back to the pool
//   } catch (error) {
//     console.error("Error connecting to MySQL database:", error);
//   }
// })();

// ----------------------------

const pool = mysql.createPool({
  host: "localhost",
    user: "root",
    password: "",
    database: "nafscare",
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database successfully!");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("Error connecting to MySQL database:", error);
  }
})();

// ----------------------------


// Function to save user to MySQL database
async function saveUser(user) {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const [rows, fields] = await pool.execute(
    "INSERT INTO customers (name, email, password) VALUES (?, ?, ?)",
    [user.name, user.email, hashedPassword]
  );
  return rows.insertId; // Return the inserted user's ID
}

// Function to check if password is correct
async function isPasswordCorrect(email, password) {
  const [rows, fields] = await pool.execute(
    "SELECT * FROM customers WHERE email = ?",
    [email]
  );
  if (rows.length === 0) {
    return false; // User not found
  }
  const user = rows[0];
  return await bcrypt.compare(password, user.password);
}

// Function to generate access token
function generateAccessToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
}

// Function to generate refresh token
function generateRefreshToken(user) {
  return jwt.sign(
    {
      _id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
}

module.exports = {
  saveUser,
  isPasswordCorrect,
  generateAccessToken,
  generateRefreshToken,
  pool,
};
