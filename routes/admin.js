const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcrypt');
const { requireAuth, requireSuper } = require('../middleware/auth');

// List admins (super only)
router.get('/', requireAuth, requireSuper, (req, res) => {
  const rows = db.prepare('SELECT id, username, role, created_at FROM admins').all();
  res.json(rows);
});

// Add admin (super only)
router.post('/', requireAuth, requireSuper, (req, res) => {
  const { username, password, role = 'admin' } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  try {
    db.prepare('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, role);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Could not create' });
  }
});

// Delete admin (super only)
router.delete('/:id', requireAuth, requireSuper, (req, res) => {
  db.prepare('DELETE FROM admins WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
