const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "sql5.freemysqlhosting.net",
  user: "sql5669624",
  password: "hB3vGplEnj",
  database: "sql5669624",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

module.exports = pool;