const mysql = require("mysql");
const { connect, param } = require("../routes");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nafscare",
});
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database as id " + connection.threadId);
});

const queryDatabase = async (connect, sql, params) =>
  new Promise((resolve, reject) => {
    const handleFunction = (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    };
    connect.query(sql, params, handleFunction);
  });
module.exports = { connection, queryDatabase };
