const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3002;

app.use(express.json());

const pool = new Pool({
  user: "dit_user",
  host: "postgres",
  database: "dit_bibliotheque",
  password: "dit_password",
  port: 5432,
});

app.get("/", (req, res) => {
  res.json({ service: "users-service", status: "running" });
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { full_name, email, user_type } = req.body;
    const result = await pool.query(
      "INSERT INTO users(full_name, email, user_type) VALUES($1, $2, $3) RETURNING *",
      [full_name, email, user_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, user_type } = req.body;
    const result = await pool.query(
      "UPDATE users SET full_name=$1, email=$2, user_type=$3 WHERE id=$4 RETURNING *",
      [full_name, email, user_type, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM users WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.json({ message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

pool.query("SELECT NOW()")
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database connection error:", err.message));

app.listen(PORT, () => {
  console.log(`Users service running on port ${PORT}`);
});