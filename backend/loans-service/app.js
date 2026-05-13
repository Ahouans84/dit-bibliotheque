const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3003;

app.use(express.json());

const pool = new Pool({
  user: "dit_user",
  host: "localhost",
  database: "dit_bibliotheque",
  password: "dit_password",
  port: 5432,
});

app.get("/", (req, res) => {
  res.json({ service: "loans-service", status: "running" });
});

app.get("/loans", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM loans ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/loans", async (req, res) => {
  try {
    const { user_id, book_id, status } = req.body;

    const result = await pool.query(
      "INSERT INTO loans(user_id, book_id, status) VALUES($1, $2, $3) RETURNING *",
      [user_id, book_id, status || "borrowed"]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/loans/:id/return", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE loans
      SET status='returned',
          return_date=CURRENT_TIMESTAMP
      WHERE id=$1
      RETURNING *
      `,
      [id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/loans/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM loans WHERE id=$1",
      [id]
    );

    res.json({
      message: "Emprunt supprimé"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

pool.query("SELECT NOW()")
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database connection error:", err.message));

app.listen(PORT, () => {
  console.log(`Loans service running on port ${PORT}`);
});