// Load the .env file's variables into our code
require('dotenv').config();

// Import mysql2's "promise" version — lets us use modern async/await style code
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// SSL is only enabled if DB_SSL_CA_PATH is set — locally, this stays unset,
// so nothing changes for your existing local MySQL setup. In production
// (Render), we'll set this to point at the Aiven CA certificate.
const sslConfig = process.env.DB_SSL_CA_PATH
  ? { ca: fs.readFileSync(path.resolve(process.env.DB_SSL_CA_PATH)) }
  : undefined;

// Create a connection pool — a small group of ready-to-use connections
// (better than a single connection because it handles multiple users at once)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: sslConfig,
});
module.exports = pool;