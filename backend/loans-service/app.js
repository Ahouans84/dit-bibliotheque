const express = require("express");
const { Pool } = require("pg");
const axios = require("axios");

const app = express();
const PORT = 3003;

app.use(express.json());

const pool = new Pool({
  user: "dit_user",
  host: "postgres",
  database: "dit_bibliotheque",
  password: "dit_password",
  port: 5432,
});

app.get("/", (req, res) => {
  res.json({
    service: "loans-service",
    status: "running",
  });
});

app.get("/loans", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM loans ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/loans/history", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM loans
      ORDER BY loan_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/loans/overdue", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM loans
      WHERE status = 'borrowed'
      AND loan_date < NOW() - INTERVAL '14 days'
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/loans/export/ml", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        user_id,
        book_id,
        loan_date,
        return_date,
        status
      FROM loans
      ORDER BY loan_date DESC
    `);

    res.json({
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/loans", async (req, res) => {
  try {
    const { user_id, book_id, status } = req.body;

    if (!user_id || !book_id) {
      return res.status(400).json({
        error: "user_id et book_id sont obligatoires",
      });
    }

    await axios.get(`http://users_service:3002/users/${user_id}`);
    await axios.get(`http://books_service:3001/books/${book_id}`);

    const result = await pool.query(
      `
      INSERT INTO loans(user_id, book_id, status)
      VALUES($1, $2, $3)
      RETURNING *
      `,
      [user_id, book_id, status || "borrowed"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.response) {
      return res.status(400).json({
        error: "Utilisateur ou livre introuvable",
      });
    }

    res.status(500).json({ error: error.message });
  }
});

app.put("/loans/:id/return", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE loans
      SET status = 'returned',
          return_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Emprunt introuvable",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/loans/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM loans WHERE id=$1", [id]);

    res.json({
      message: "Emprunt supprimé",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

pool
  .query("SELECT NOW()")
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database connection error:", err.message));

app.listen(PORT, () => {
  console.log(`Loans service running on port ${PORT}`);
});