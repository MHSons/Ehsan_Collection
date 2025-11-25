const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

// Public: list products
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM products').all();
  res.json(rows);
});

// Admin: create product
router.post('/', requireAuth, (req, res) => {
  const { title, description, price, currency='PKR', image='', stock=0 } = req.body;
  const info = db.prepare('INSERT INTO products (title, description, price, currency, image, stock) VALUES (?, ?, ?, ?, ?, ?)').run(title, description, price, currency, image, stock);
  res.json({ id: info.lastInsertRowid });
});

// Admin: update product
router.put('/:id', requireAuth, (req, res) => {
  const id = req.params.id;
  const { title, description, price, stock, image } = req.body;
  db.prepare('UPDATE products SET title=?, description=?, price=?, stock=?, image=? WHERE id=?').run(title, description, price, stock, image, id);
  res.json({ ok: true });
});

// Admin: delete
router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
