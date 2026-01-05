import express from 'express';
import cors from 'cors';
import db from './db/database.js';
import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import snippetRoutes from './routes/snippets.js';
import categoryRoutes from './routes/categories.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database and seed
import('./db/seed.js').catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/snippets', authenticate, snippetRoutes);
app.use('/api/categories', authenticate, categoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
