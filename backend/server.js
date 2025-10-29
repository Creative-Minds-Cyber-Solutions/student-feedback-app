require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'sql8.freesqldatabase.com',
  user: process.env.DB_USER || 'sql8804970',
  password: process.env.DB_PASSWORD || 'DNTiFkMl1a',
  database: process.env.DB_NAME || 'sql8804970'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
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

db.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Feedback table ready');
  }
});

// API Routes

// GET all feedback
app.get('/api/feedback', (req, res) => {
  const query = 'SELECT * FROM Feedback ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      return res.status(500).json({ 
        error: 'Failed to retrieve feedback',
        details: err.message 
      });
    }
    res.json(results);
  });
});

// POST new feedback
app.post('/api/feedback', (req, res) => {
  const { studentName, courseCode, comments, rating } = req.body;

  // Validation
  if (!studentName || !courseCode || !comments || !rating) {
    return res.status(400).json({ 
      error: 'All fields are required' 
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ 
      error: 'Rating must be between 1 and 5' 
    });
  }

  const query = 'INSERT INTO Feedback (studentName, courseCode, comments, rating) VALUES (?, ?, ?, ?)';
  
  db.query(query, [studentName, courseCode, comments, rating], (err, result) => {
    if (err) {
      console.error('Error adding feedback:', err);
      return res.status(500).json({ 
        error: 'Failed to add feedback',
        details: err.message 
      });
    }
    res.status(201).json({ 
      message: 'Feedback added successfully',
      id: result.insertId 
    });
  });
});

// DELETE feedback
app.delete('/api/feedback/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Feedback WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting feedback:', err);
      return res.status(500).json({ 
        error: 'Failed to delete feedback',
        details: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Feedback not found' 
      });
    }
    
    res.json({ message: 'Feedback deleted successfully' });
  });
});

// GET dashboard statistics
app.get('/api/dashboard', (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as totalFeedback,
      AVG(rating) as averageRating,
      MAX(rating) as highestRating,
      MIN(rating) as lowestRating
    FROM Feedback
  `;
  
  db.query(statsQuery, (err, results) => {
    if (err) {
      console.error('Error fetching statistics:', err);
      return res.status(500).json({ 
        error: 'Failed to retrieve statistics',
        details: err.message 
      });
    }
    res.json(results[0]);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});