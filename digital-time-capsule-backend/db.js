// db.js

const { Pool } = require('pg');

// Connection details are automatically picked up from the DATABASE_URL environment variable
// or you can configure them explicitly using an object.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional: ssl: { rejectUnauthorized: false } for some cloud providers
});

// Simple function to test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database.');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};