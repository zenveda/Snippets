import db from './database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Create demo users
const users = [
  {
    id: uuidv4(),
    email: 'admin@example.com',
    password_hash: bcrypt.hashSync('admin123', 10),
    name: 'Admin User',
    role: 'admin',
    team_id: null
  },
  {
    id: uuidv4(),
    email: 'user@example.com',
    password_hash: bcrypt.hashSync('user123', 10),
    name: 'Sales Rep',
    role: 'user',
    team_id: 'team-1'
  },
  {
    id: uuidv4(),
    email: 'manager@example.com',
    password_hash: bcrypt.hashSync('manager123', 10),
    name: 'Sales Manager',
    role: 'manager',
    team_id: 'team-1'
  }
];

// Insert users
const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (id, email, password_hash, name, role, team_id)
  VALUES (?, ?, ?, ?, ?, ?)
`);

users.forEach(user => {
  insertUser.run(user.id, user.email, user.password_hash, user.name, user.role, user.team_id);
});

// Create demo snippets
const snippets = [
  {
    id: uuidv4(),
    name: 'Intro - Product Demo',
    body: 'Hi {{first_name}},\n\nI hope this email finds you well. I\'d love to show you how {{product_name}} can help {{company_name}} achieve {{benefit}}.\n\nWould you be available for a quick 15-minute demo this week?',
    shortcut: '/intro-demo',
    category: 'Introduction',
    owner_id: users[1].id,
    scope: 'personal',
    status: 'published',
    version: 1,
    tags: 'intro,demo,product'
  },
  {
    id: uuidv4(),
    name: 'Value Prop - Time Savings',
    body: 'Our platform helps teams save {{hours}} hours per week by automating {{task_type}}. This translates to {{cost_savings}} in operational costs annually.',
    shortcut: '/value-time',
    category: 'Value Proposition',
    owner_id: users[2].id,
    scope: 'team',
    status: 'published',
    version: 1,
    tags: 'value,time-savings,automation'
  },
  {
    id: uuidv4(),
    name: 'Objection - Pricing',
    body: 'I understand pricing is a concern. Let me share that {{customer_name}} saw a {{roi}}% ROI in the first quarter. We also offer flexible pricing plans that scale with your needs.\n\nWould you like to see a detailed cost breakdown?',
    shortcut: '/objection-pricing',
    category: 'Objection Handling',
    owner_id: users[1].id,
    scope: 'personal',
    status: 'published',
    version: 1,
    tags: 'objection,pricing,roi'
  },
  {
    id: uuidv4(),
    name: 'Follow-up - No Response',
    body: 'Hi {{first_name}},\n\nI wanted to follow up on my previous email about {{topic}}. I know you\'re busy, so I\'ll keep this brief.\n\nWould a quick {{duration}}-minute call work better for you?',
    shortcut: '/followup',
    category: 'Follow-up',
    owner_id: users[2].id,
    scope: 'org',
    status: 'published',
    version: 1,
    tags: 'followup,no-response'
  },
  {
    id: uuidv4(),
    name: 'Meeting Request',
    body: 'Hi {{first_name}},\n\nI\'d love to schedule a call to discuss how we can help {{company_name}}. Are you available for a {{duration}}-minute conversation on {{day}}?',
    shortcut: '/meeting',
    category: 'Meeting Request',
    owner_id: users[1].id,
    scope: 'personal',
    status: 'published',
    version: 1,
    tags: 'meeting,request'
  }
];

const insertSnippet = db.prepare(`
  INSERT OR REPLACE INTO snippets 
  (id, name, body, shortcut, category, owner_id, scope, status, version, tags)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

snippets.forEach(snippet => {
  insertSnippet.run(
    snippet.id,
    snippet.name,
    snippet.body,
    snippet.shortcut,
    snippet.category,
    snippet.owner_id,
    snippet.scope,
    snippet.status,
    snippet.version,
    snippet.tags
  );
});

console.log('Database seeded successfully!');
