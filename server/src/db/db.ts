import { Pool } from 'pg';

require('dotenv').config({ path: '../.env' });

const db = new Pool({
  user: process.env.DB_USER, // Database username
  host: process.env.NODE_ENV === 'prod' ? 'db' : 'localhost', // Database host
  database: process.env.DB_NAME, // Database name
  password: process.env.DB_PASSWORD, // Database password
  port: 5432, // Database port (default for PostgreSQL)
});

// Test connection

export default db;
