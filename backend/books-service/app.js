const express = require("express");

const app = express();
const PORT = 3001;
const pool = require("./db");

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "books-service",
    status: "running"
  });
});

pool.query("SELECT NOW()")
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });

// Création de la table des livres
const createTable = async () => {

    const query = `
    
    CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(100) UNIQUE NOT NULL
    )
    
    `;

    await pool.query(query);

    console.log("Table books created");
};

createTable();

// Ajouter un livre
app.post("/books", async (req, res) => {

    try {

        const { title, author, isbn } = req.body;

        const result = await pool.query(
            `
            INSERT INTO books(title, author, isbn)
            VALUES($1, $2, $3)
            RETURNING *
            `,
            [title, author, isbn]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
});

// Modifier un livre
app.put("/books/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const { title, author, isbn } = req.body;

        const result = await pool.query(
            `
            UPDATE books
            SET title=$1, author=$2, isbn=$3
            WHERE id=$4
            RETURNING *
            `,
            [title, author, isbn, id]
        );

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
});

// Supprimer un livre
app.delete("/books/:id", async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(
            "DELETE FROM books WHERE id=$1",
            [id]
        );

        res.json({
            message: "Livre supprimé"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
});

// Lister les livres
app.get("/books", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM books ORDER BY id DESC"
        );

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
});

// Rechercher un livre par titre, auteur ou ISBN
app.get("/books/search", async (req, res) => {

  try {

    const { title, author, isbn } = req.query;

    let query = "SELECT * FROM books WHERE 1=1";

    let values = [];

    let count = 1;

    if (title) {
      query += ` AND title ILIKE $${count}`;
      values.push(`%${title}%`);
      count++;
    }

    if (author) {
      query += ` AND author ILIKE $${count}`;
      values.push(`%${author}%`);
      count++;
    }

    if (isbn) {
      query += ` AND isbn ILIKE $${count}`;
      values.push(`%${isbn}%`);
      count++;
    }

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
});


app.listen(PORT, () => {
  console.log(`Books service running on port ${PORT}`);
});