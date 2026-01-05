import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export class Snippet {
  static findAll(userId, userRole, userTeamId, filters = {}) {
    let query = `
      SELECT s.*, u.name as owner_name, u.email as owner_email
      FROM snippets s
      JOIN users u ON s.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Scope-based filtering
    if (userRole !== 'admin') {
      query += ` AND (
        s.scope = 'org' OR
        (s.scope = 'team' AND s.owner_id IN (SELECT id FROM users WHERE team_id = ?)) OR
        (s.scope = 'personal' AND s.owner_id = ?)
      )`;
      params.push(userTeamId, userId);
    }

    // Status filter
    if (filters.status) {
      query += ` AND s.status = ?`;
      params.push(filters.status);
    } else {
      // Default: exclude archived
      query += ` AND s.status != 'archived'`;
    }

    // Category filter
    if (filters.category) {
      query += ` AND s.category = ?`;
      params.push(filters.category);
    }

    // Scope filter
    if (filters.scope) {
      query += ` AND s.scope = ?`;
      params.push(filters.scope);
    }

    // Search filter
    if (filters.search) {
      query += ` AND (s.name LIKE ? OR s.body LIKE ? OR s.tags LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY s.updated_at DESC`;

    return db.prepare(query).all(...params);
  }

  static findById(id) {
    return db.prepare(`
      SELECT s.*, u.name as owner_name, u.email as owner_email
      FROM snippets s
      JOIN users u ON s.owner_id = u.id
      WHERE s.id = ?
    `).get(id);
  }

  static findByShortcut(shortcut, userId, userRole, userTeamId) {
    // Check in order: personal, team, org
    const queries = [
      // Personal
      db.prepare(`
        SELECT s.* FROM snippets s
        WHERE s.shortcut = ? AND s.scope = 'personal' AND s.owner_id = ? AND s.status = 'published'
        ORDER BY s.created_at DESC LIMIT 1
      `),
      // Team
      db.prepare(`
        SELECT s.* FROM snippets s
        WHERE s.shortcut = ? AND s.scope = 'team' 
        AND s.owner_id IN (SELECT id FROM users WHERE team_id = ?)
        AND s.status = 'published'
        ORDER BY s.created_at DESC LIMIT 1
      `),
      // Org
      db.prepare(`
        SELECT s.* FROM snippets s
        WHERE s.shortcut = ? AND s.scope = 'org' AND s.status = 'published'
        ORDER BY s.created_at DESC LIMIT 1
      `)
    ];

    for (const query of queries) {
      let result;
      if (query === queries[0]) {
        result = query.get(shortcut, userId);
      } else if (query === queries[1]) {
        result = query.get(shortcut, userTeamId);
      } else {
        result = query.get(shortcut);
      }
      if (result) return result;
    }

    return null;
  }

  static create(snippetData) {
    const {
      name,
      body,
      shortcut,
      category,
      owner_id,
      scope,
      status,
      tags
    } = snippetData;

    const id = uuidv4();
    const version = 1;

    db.prepare(`
      INSERT INTO snippets 
      (id, name, body, shortcut, category, owner_id, scope, status, version, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, body, shortcut, category, owner_id, scope, status || 'draft', version, tags);

    // Save version
    this.saveVersion(id, version, { name, body, shortcut, category, tags });

    return this.findById(id);
  }

  static update(id, snippetData, userId, userRole) {
    const snippet = this.findById(id);
    if (!snippet) {
      throw new Error('Snippet not found');
    }

    // Check permissions
    if (snippet.owner_id !== userId && userRole !== 'admin' && userRole !== 'manager') {
      throw new Error('Unauthorized');
    }

    const {
      name,
      body,
      shortcut,
      category,
      scope,
      status,
      tags
    } = snippetData;

    const newVersion = snippet.version + 1;

    db.prepare(`
      UPDATE snippets
      SET name = ?, body = ?, shortcut = ?, category = ?, scope = ?, status = ?, version = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name || snippet.name, body || snippet.body, shortcut || snippet.shortcut, 
           category || snippet.category, scope || snippet.scope, 
           status || snippet.status, newVersion, tags || snippet.tags, id);

    // Save new version
    if (body || name || shortcut || category) {
      const updated = this.findById(id);
      this.saveVersion(id, newVersion, {
        name: updated.name,
        body: updated.body,
        shortcut: updated.shortcut,
        category: updated.category,
        tags: updated.tags
      });
    }

    return this.findById(id);
  }

  static delete(id, userId, userRole) {
    const snippet = this.findById(id);
    if (!snippet) {
      throw new Error('Snippet not found');
    }

    // Check permissions
    if (snippet.owner_id !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    db.prepare('DELETE FROM snippets WHERE id = ?').run(id);
    db.prepare('DELETE FROM snippet_versions WHERE snippet_id = ?').run(id);
    
    return true;
  }

  static trackInsertion(id) {
    db.prepare(`
      UPDATE snippets
      SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);
  }

  static saveVersion(snippetId, version, data) {
    const versionId = uuidv4();
    db.prepare(`
      INSERT INTO snippet_versions (id, snippet_id, version, name, body, shortcut, category, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(versionId, snippetId, version, data.name, data.body, data.shortcut, data.category, data.tags);
  }

  static getVersions(snippetId) {
    return db.prepare(`
      SELECT * FROM snippet_versions
      WHERE snippet_id = ?
      ORDER BY version DESC
    `).all(snippetId);
  }

  static getCategories() {
    return db.prepare(`
      SELECT DISTINCT category
      FROM snippets
      WHERE category IS NOT NULL AND category != '' AND status != 'archived'
      ORDER BY category
    `).all().map(row => row.category);
  }
}
