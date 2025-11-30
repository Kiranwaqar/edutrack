const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER || 'dbuser',
  password: process.env.DB_PASSWORD || 'StrongPassword123!',
  database: process.env.DB_NAME || 'edutrackdb',
  max: 10
});

const app = express();
app.use(bodyParser.json());

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Create student
app.post('/students', async (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });

  try {
    const q = 'INSERT INTO students(name, email) VALUES($1, $2) RETURNING *';
    const r = await pool.query(q, [name, email]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('student create error', err);
    if (err.code === '23505') return res.status(409).json({ error: 'email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// List students
app.get('/students', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM students ORDER BY id');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get student by id
app.get('/students/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const r = await pool.query('SELECT * FROM students WHERE id=$1', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'student not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Simple readiness probe for k8s
app.get('/ready', (req, res) => res.sendStatus(200));

app.listen(PORT, () => {
  console.log(`Student service listening on ${PORT}`);
});
