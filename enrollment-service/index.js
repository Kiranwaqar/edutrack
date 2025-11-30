const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3002;

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

// enroll a student in a course
app.post('/enrollments', async (req, res) => {
  const { student_id, course_id } = req.body || {};
  if (!student_id || !course_id) return res.status(400).json({ error: 'student_id and course_id required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ensure student exists
    const s = await client.query('SELECT id FROM students WHERE id=$1', [student_id]);
    if (s.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'student not found' });
    }

    // ensure course exists
    const c = await client.query('SELECT id FROM courses WHERE id=$1', [course_id]);
    if (c.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'course not found' });
    }

    // insert enrollment (unique constraint prevents duplicates)
    const q = 'INSERT INTO enrollments(student_id, course_id) VALUES($1,$2) RETURNING *';
    const r = await client.query(q, [student_id, course_id]);
    await client.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('enroll error', err);
    // handle duplicate enroll attempts
    if (err.code === '23505') return res.status(409).json({ error: 'already enrolled' });
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// list enrollments with optional join data
app.get('/enrollments', async (req, res) => {
  try {
    const q = `
      SELECT e.id, e.student_id, s.name as student_name, e.course_id, co.title as course_title, e.enrolled_at
      FROM enrollments e
      LEFT JOIN students s ON s.id = e.student_id
      LEFT JOIN courses co ON co.id = e.course_id
      ORDER BY e.id`;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/enrollments/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const q = `
      SELECT e.id, e.student_id, s.name as student_name, e.course_id, co.title as course_title, e.enrolled_at
      FROM enrollments e
      LEFT JOIN students s ON s.id = e.student_id
      LEFT JOIN courses co ON co.id = e.course_id
      WHERE e.id=$1`;
    const r = await pool.query(q, [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'enrollment not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/ready', (req, res) => res.sendStatus(200));

app.listen(PORT, () => {
  console.log(`Enrollment service listening on ${PORT}`);
});
