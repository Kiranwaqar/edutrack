const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3001;

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

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// create a course
app.post('/courses', async (req, res) => {
  const { title, description } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });

  try {
    const q = 'INSERT INTO courses(title, description) VALUES($1, $2) RETURNING *';
    const r = await pool.query(q, [title, description || null]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('course create error', err);
    res.status(500).json({ error: err.message });
  }
});

// list courses
app.get('/courses', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM courses ORDER BY id');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// get course by id
app.get('/courses/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const r = await pool.query('SELECT * FROM courses WHERE id=$1', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'course not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/ready', (req, res) => res.sendStatus(200));

app.listen(PORT, () => {
  console.log(`Course service listening on ${PORT}`);
});
