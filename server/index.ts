import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import db from './src/db/db';
import initRoutes from './src/routes';

dotenv.config();
const app: express.Application = express();
const port: number = 3000;
const corsOptions = {
  origin: 'http://localhost:5173',
};
app.use(cors(corsOptions));
initRoutes(app);
if (!module.parent) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

app.get('/api/data', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send(`Error retrieving data: ${err}`);
  }
});

export { app };
