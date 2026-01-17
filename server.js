const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Database
const db = new sqlite3.Database("./journal.db");

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ➕ Add entry
app.post("/entries", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });

  db.run(
    "INSERT INTO entries (text) VALUES (?)",
    [text],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

// 📥 Get entries
app.get("/entries", (req, res) => {
  db.all(
    "SELECT * FROM entries ORDER BY created_at DESC",
    [],
    (err, rows) => {
      res.json(rows);
    }
  );
});

// ❌ Delete entry
app.delete("/entries/:id", (req, res) => {
  db.run(
    "DELETE FROM entries WHERE id = ?",
    [req.params.id],
    () => res.json({ success: true })
  );
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
