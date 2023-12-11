const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "Patwari@2023",
  database: "personal_budget_app",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

module.exports = pool;