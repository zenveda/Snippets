import db from '../db/database.js';

export class User {
  static findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  static create(userData) {
    const { id, email, password_hash, name, role, team_id } = userData;
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, team_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, email, password_hash, name, role, team_id);
    return this.findById(id);
  }
}
