import { Pool } from 'pg';

const db = new Pool({
  user: 'admin', // Database username
  host: 'localhost', // Database host
  database: 'kiruna', // Database name
  password: 'admin', // Database password
  port: 5432, // Database port (default for PostgreSQL)
});

export default db;
