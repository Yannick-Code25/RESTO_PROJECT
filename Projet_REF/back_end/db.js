const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "othi",
  database: "resto",
  port: 5432,
});

pool
  .connect()
  .then(() => console.log("Connecté à PostgreSQL ✅"))
  .catch((err) => console.error("Erreur de connexion ❌", err));

module.exports = pool;
