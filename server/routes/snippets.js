import express from 'express';
import { Snippet } from '../models/Snippet.js';

const router = express.Router();

// Get all snippets
router.get('/', (req, res) => {
  try {
    const { status, category, scope, search } = req.query;
    const filters = { status, category, scope, search };
    
    const snippets = Snippet.findAll(
      req.user.id,
      req.user.role,
      req.user.team_id,
      filters
    );

    res.json(snippets);
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get snippet by ID
router.get('/:id', (req, res) => {
  try {
    const snippet = Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(snippet);
  } catch (error) {
    console.error('Error fetching snippet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create snippet
router.post('/', (req, res) => {
  try {
    const { name, body, shortcut, category, scope, status, tags } = req.body;

    if (!name || !body) {
      return res.status(400).json({ error: 'Name and body are required' });
    }

    const snippet = Snippet.create({
      name,
      body,
      shortcut,
      category,
      owner_id: req.user.id,
      scope: scope || 'personal',
      status: status || 'draft',
      tags
    });

    res.status(201).json(snippet);
  } catch (error) {
    console.error('Error creating snippet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update snippet
router.put('/:id', (req, res) => {
  try {
    const snippet = Snippet.update(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    res.json(snippet);
  } catch (error) {
    if (error.message === 'Snippet not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: error.message });
    }
    console.error('Error updating snippet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete snippet
router.delete('/:id', (req, res) => {
  try {
    Snippet.delete(req.params.id, req.user.id, req.user.role);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Snippet not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: error.message });
    }
    console.error('Error deleting snippet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track snippet insertion
router.post('/:id/insert', (req, res) => {
  try {
    Snippet.trackInsertion(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking insertion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get snippet versions
router.get('/:id/versions', (req, res) => {
  try {
    const versions = Snippet.getVersions(req.params.id);
    res.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search by shortcut
router.get('/shortcut/:shortcut', (req, res) => {
  try {
    const snippet = Snippet.findByShortcut(
      req.params.shortcut,
      req.user.id,
      req.user.role,
      req.user.team_id
    );
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    res.json(snippet);
  } catch (error) {
    console.error('Error fetching snippet by shortcut:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
