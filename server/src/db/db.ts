import { Pool } from 'pg';

require('dotenv').config({ path: '../.env' });

const db = new Pool({
  user: process.env.DB_USER, // Database username
  host: 'localhost', // Database host
  database: process.env.DB_NAME, // Database name
  password: process.env.DB_PASSWORD, // Database password
  port: 5432, // Database port (default for PostgreSQL)
});

// Test connection
db.connect()
  .then(() => {
    console.log('Connected to the database');
    return db.query('SELECT NOW()');
  })
  .then(result => {
    console.log('Date and hour:', result.rows[0].now.toLocaleString());
  })
  .catch(err => {
    console.error('Error during connection to db:', err);
  });

export default db;
