// Load the .env file's variables into our code
require('dotenv').config();

// Import mysql2's "promise" version — lets us use modern async/await style code
const mysql = require('mysql2/promise');

// Create a connection pool — a small group of ready-to-use connections
// (better than a single connection because it handles multiple users at once)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;