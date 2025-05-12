// server.js
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;
const DBFILE = path.join(__dirname, "data", "simple.db");

// —— Middleware ——
app.use(express.json());                    // parse JSON bodies (optional fallback)
app.use(express.urlencoded({ extended: true })); // parse HTML form bodies
app.use(express.static(__dirname));         // serve HTML, CSS, images, etc.

// —— Initialize / open the database ——
const db = new sqlite3.Database(DBFILE, err => {
  if (err) {
    console.error("❌ Failed to open database:", err);
    process.exit(1);
  }
  // Ensure 'applications' table exists
  db.run(
    `CREATE TABLE IF NOT EXISTS applications (
       id              INTEGER PRIMARY KEY,
       applicantName   TEXT,
       applicantEmail  TEXT,
       selectedCourse  TEXT,
       courseLevel     TEXT,
       created_at      TEXT
     )`,
    err => { if (err) console.error("Applications table error:", err); }
  );
});

// —— Form submission endpoint ——
app.post("/submit", (req, res) => {
  // Extract form fields
  const { applicantName, applicantEmail, selectedCourse, courseLevel } = req.body;
  const created_at = new Date().toISOString();

  // Insert into 'applications' table
  db.run(
    `INSERT INTO applications (applicantName, applicantEmail, selectedCourse, courseLevel, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [applicantName, applicantEmail, selectedCourse, courseLevel, created_at],
    function(err) {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).send(
          `<h1>Server error</h1><p>Could not save your application.</p>`
        );
      }
      // Send back a simple confirmation page
      res.send(
        `<html>
           <body>
             <h1>Thank you, ${applicantName}!</h1>
             <p>Your application ID is ${this.lastID}.</p>
             <p><a href=\"/\">Go back to the form</a></p>
           </body>
         </html>`
      );
    }
  );
});

// —— Start the server ——
app.listen(PORT, () => {
  console.log(`✅ Tom has started the server. Server running: http://localhost:${PORT}/`);
});
