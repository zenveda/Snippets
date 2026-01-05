import express from 'express';
import { Snippet } from '../models/Snippet.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const categories = Snippet.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
