const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const port = process.env.PORT || 3001;
const jwt = require("jsonwebtoken");
const { expressjwt: exjwt } = require("express-jwt");
const path = require("path");
const compression = require("compression");
const secretKey = "$eCr6TK#^";
const pool = require("./db");

const app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
  next();
});

const jwtMW = exjwt({ secret: secretKey, algorithms: ["HS256"] }).unless({
    path: ["/api/signup", "/api/login"], // Paths that do not require a token
  });

app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, (hashErr, hash) => {
    if (hashErr) {
      return res.status(500).json({ error: "Error hashing the password" });
    }

    pool.execute(
      "INSERT INTO users(username, password) VALUES (?, ?)",
      [username, hash],
      (insertErr, results, fields) => {
        if (insertErr) {
          console.error("Error inserting user:", insertErr);

          // Provide a more detailed error message based on the specific error
          let errorMessage;
          if (insertErr.code === "ER_DUP_ENTRY") {
            errorMessage =
              "Username already exists. Please choose a different username.";
          } else {
            errorMessage = "Error inserting user.";
          }

          return res.status(500).json({ error: errorMessage });
        }

        res.json({ message: "SignedUp successful" });
      }
    );
  });
});


app.post("/api/extend-token", jwtMW, (req, res) => {
  try {
    console.log("Request details:", req.auth.username);

    // Check if req.user exists
    if (!req.auth.username) {
      console.error("User information not available in the token");
      return res.status(400).json({ error: "User information not available in the token" });
    }

    // Access user information from the decoded token
    const { id, username } = req.auth;

    if (!id || !username) {
      console.error("Invalid user information in the token");
      return res.status(400).json({ error: "Invalid user information in the token" });
    }

    // Create a new token with extended expiration
    const token = jwt.sign({ id, username }, secretKey, { expiresIn: "1m" });
    console.log("Token extended successfully:", { id, username });

    res.status(200).json({ message: "Token extended successfully", token });
  } catch (error) {
    console.error("Error extending token:", error);

    // Log the error details for investigation
    res.status(500).json({ error: "Internal Server Error. Check server logs for details." });
  }
});







app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  let token;
  pool.execute(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      
      if (err) {
        console.error("MySQL query error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length > 0) {
        const hashedPassword = results[0].password;

        bcrypt.compare(password, hashedPassword, (bcryptErr, bcryptResult) => {
          if (bcryptErr) {
            console.error("Error comparing passwords:", bcryptErr);
            return res.status(500).json({ message: "Internal Server Error" });
          }

          if (bcryptResult) {
            token = jwt.sign({ id: results[0].id, username: results[0].username }, secretKey, {
              expiresIn: "1m",
            });
            res.status(200).json({ message: "Login successful", id: results[0].id, token});
          } else {
            res.status(401).json({ message: "Incorrect credentials" });
          }
        });
      } else {
        res.status(401).json({ message: "Incorrect credentials" });
      }
    }
  );
});

app.get("/api/budget/:id", jwtMW, async (req, res) => {
  const userId = req.params.id;
  pool.execute(
    "SELECT * FROM budget WHERE id = ?",[userId],
    (err, results, fields) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }

      res.json(results);
    }
  );
});

app.put('/api/budget/:budgetId',jwtMW, (req, res) => {
  const budgetId = req.params.budgetId;
  const { month, year, title, budget } = req.body;
  // The fieldsToUpdate array will store the fields to be updated
  const fieldsToUpdate = [];
  const valuesToUpdate = [];

  // Check if each field exists in the request body, and if yes, add it to the update query
  if (month !== undefined) {
    fieldsToUpdate.push('month');
    valuesToUpdate.push(month);
  }

  if (year !== undefined) {
    fieldsToUpdate.push('year');
    valuesToUpdate.push(year);
  }

  if (title !== undefined) {
    fieldsToUpdate.push('title');
    valuesToUpdate.push(title);
  }

  if (budget !== undefined) {
    fieldsToUpdate.push('budget');
    valuesToUpdate.push(budget);
  }

  // Construct the dynamic part of the SQL query based on the fields to be updated
  const dynamicSetClause = fieldsToUpdate.map((field) => `${field} = ?`).join(', ');
  const query = `UPDATE budget SET ${dynamicSetClause} WHERE budgetId = ?`;

  // Execute the query with the dynamic values
  pool.query(query, [...valuesToUpdate, budgetId], (err, results) => {
    if (err) {
      console.error('Error updating budget:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Budget updated successfully' });
    }
  });
});

app.post("/api/budget/:id", jwtMW,(req, res) => {
  const userId = req.params.id;
  const { month, year, title, budget, color } = req.body;
  const query = "INSERT INTO budget(id, month, year, title, budget, color) VALUES (?, ?, ?, ?, ?, ?)";

  pool.query(query, [userId, month, year, title, budget, color], (err, results) => {
    if (err) {
      console.error("MySQL query error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json({ message: "Budget added successfully" });
    }
  });
});

app.delete("/api/budget/:budgetId", (req, res) => {
  const budgetId = req.params.budgetId;

  const query = `DELETE FROM budget WHERE budgetId = ?`;

  pool.query(query, [budgetId], (err, results) => {
    if (err) {
      console.error("Error deleting budget:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json({ message: "Budget deleted successfully" });
    }
  });
});


app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Unauthorized - Token is either missing or invalid" });
  }
  next(); // Pass the error to the next middleware
});

app.listen(port, () => {
  console.log(`Server on port ${port}`);
});

module.exports = app;