import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard`);
      setStats(response.data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="stars-large">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= fullStars ? 'filled' : (star === fullStars + 1 && hasHalfStar ? 'half' : '')}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h2>Feedback Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Total Feedback</h3>
            <p className="stat-number">{stats.totalFeedback || 0}</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <p className="stat-number">
              {stats.averageRating && !isNaN(stats.averageRating) 
                ? Number(stats.averageRating).toFixed(2) 
                : '0.00'}
            </p>
            {stats.averageRating && stats.averageRating > 0 && renderStars(stats.averageRating)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Highest Rating</h3>
            <p className="stat-number">{stats.highestRating || 0}/5</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Lowest Rating</h3>
            <p className="stat-number">{stats.lowestRating || 0}/5</p>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <h3>Welcome to the Student Feedback System</h3>
        <p>This dashboard provides an overview of all submitted course feedback. Use the tabs above to submit new feedback or view all submissions.</p>
      </div>
    </div>
  );
};

export default Dashboard;