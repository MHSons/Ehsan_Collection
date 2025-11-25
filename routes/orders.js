const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');

// Place order (guest checkout). items = [{productId, qty}]
router.post('/', (req, res) => {
  const { items, customer_info, currency='PKR' } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Invalid items' });

  // Compute total
  let total = 0;
  const detailed = items.map(it => {
    const p = db.prepare('SELECT * FROM products WHERE id = ?').get(it.productId);
    const price = p ? p.price : 0;
    total += price * it.qty;
    return { productId: it.productId, title: p ? p.title : 'Unknown', qty: it.qty, price };
  });

  const order_uuid = uuidv4();
  db.prepare('INSERT INTO orders (order_uuid, items, total, currency, customer_info) VALUES (?, ?, ?, ?, ?)')
    .run(order_uuid, JSON.stringify(detailed), total, currency, JSON.stringify(customer_info || {}));

  // Return order id and (mock) payment link
  res.json({
    order_uuid,
    total,
    currency,
    payment_url: `/api/orders/${order_uuid}/pay-mock`
  });
});

// Mock payment endpoint (would be replaced by real gateway webhook)
router.get('/:uuid/pay-mock', (req, res) => {
  const uuid = req.params.uuid;
  // mark as paid
  db.prepare('UPDATE orders SET status = ? WHERE order_uuid = ?').run('paid', uuid);
  res.send(`Order ${uuid} marked as paid (mock). Admin will see status updated.`);
});

// Admin: list orders
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  // parse items/tracking/customer
  const formatted = rows.map(r => ({
    id: r.id,
    order_uuid: r.order_uuid,
    items: JSON.parse(r.items),
    total: r.total,
    currency: r.currency,
    customer_info: JSON.parse(r.customer_info || '{}'),
    status: r.status,
    tracking: JSON.parse(r.tracking || '{}'),
    created_at: r.created_at
  }));
  res.json(formatted);
});

// Admin: update order status & tracking
router.put('/:uuid', requireAuth, (req, res) => {
  const uuid = req.params.uuid;
  const { status, tracking } = req.body;
  const trackingStr = tracking ? JSON.stringify(tracking) : db.prepare('SELECT tracking FROM orders WHERE order_uuid = ?').get(uuid).tracking;
  db.prepare('UPDATE orders SET status = ?, tracking = ? WHERE order_uuid = ?').run(status || 'processing', trackingStr, uuid);
  res.json({ ok: true });
});

// Public: get order status by uuid (guest can track)
router.get('/:uuid', (req, res) => {
  const uuid = req.params.uuid;
  const row = db.prepare('SELECT * FROM orders WHERE order_uuid = ?').get(uuid);
  if(!row) return res.status(404).json({ error: 'Not found' });
  res.json({
    order_uuid: row.order_uuid,
    items: JSON.parse(row.items),
    total: row.total,
    currency: row.currency,
    status: row.status,
    tracking: JSON.parse(row.tracking || '{}'),
    created_at: row.created_at
  });
});

module.exports = router;
