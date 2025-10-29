require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'sql8.freesqldatabase.com',
  user: process.env.DB_USER || 'sql8804970',
  password: process.env.DB_PASSWORD || 'DNTiFkMl1a',
  database: process.env.DB_NAME || 'sql8804970',
  waitForConnections: true,
  connectionLimit: 10, // max simultaneous connections
  queueLimit: 0
});

// Helper to execute queries
const query = (sql, params) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

// Create Feedback table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS Feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentName VARCHAR(255) NOT NULL,
    courseCode VARCHAR(50) NOT NULL,
    comments TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

query(createTableQuery)
  .then(() => console.log('Feedback table ready'))
  .catch(err => console.error('Error creating table:', err));

// API Routes

// GET all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const results = await query('SELECT * FROM Feedback ORDER BY created_at DESC');
    res.json(results);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ error: 'Failed to retrieve feedback', details: err.message });
  }
});

// POST new feedback
app.post('/api/feedback', async (req, res) => {
  const { studentName, courseCode, comments, rating } = req.body;

  if (!studentName || !courseCode || !comments || !rating) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const result = await query(
      'INSERT INTO Feedback (studentName, courseCode, comments, rating) VALUES (?, ?, ?, ?)',
      [studentName, courseCode, comments, rating]
    );
    res.status(201).json({ message: 'Feedback added successfully', id: result.insertId });
  } catch (err) {
    console.error('Error adding feedback:', err);
    res.status(500).json({ error: 'Failed to add feedback', details: err.message });
  }
});

// DELETE feedback
app.delete('/api/feedback/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM Feedback WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ error: 'Failed to delete feedback', details: err.message });
  }
});

// GET dashboard statistics
app.get('/api/dashboard', async (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as totalFeedback,
      AVG(rating) as averageRating,
      MAX(rating) as highestRating,
      MIN(rating) as lowestRating
    FROM Feedback
  `;

  try {
    const results = await query(statsQuery);
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ error: 'Failed to retrieve statistics', details: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
