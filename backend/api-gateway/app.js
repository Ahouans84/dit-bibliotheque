const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "running",
    message: "Gateway principale de la bibliothèque numérique DIT"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    services: {
      books: "http://books-service:3001",
      users: "http://users-service:3002",
      loans: "http://loans-service:3003",
      recommendations: "http://recommendation-service:3004"
    }
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});