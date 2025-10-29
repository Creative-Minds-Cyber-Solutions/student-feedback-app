import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackList = ({ refreshTrigger }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, [refreshTrigger]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/feedback`);
      setFeedbackList(response.data);
    } catch (err) {
      setError('Failed to load feedback. Please try again later.');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/feedback/${id}`);
      setFeedbackList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete feedback. Please try again.');
      console.error('Error deleting feedback:', err);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'filled' : ''}>
      
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="feedback-list-container">
        <div className="loading">Loading feedback...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-list-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchFeedback} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-list-container">
      <h2>All Feedback</h2>
      
      {feedbackList.length === 0 ? (
        <div className="no-feedback">
          <p>No feedback submitted yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="feedback-grid">
          {feedbackList.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="feedback-header">
                <div>
                  <h3>{feedback.studentName}</h3>
                  <span className="course-code">{feedback.courseCode}</span>
                </div>
                <button 
                  onClick={() => handleDelete(feedback.id)}
                  className="delete-btn"
                  title="Delete feedback"
                >
                  
                </button>
              </div>
              
              <div className="feedback-rating">
                {renderStars(feedback.rating)}
                <span className="rating-number">{feedback.rating}/5</span>
              </div>
              
              <p className="feedback-comments">{feedback.comments}</p>
              
              <div className="feedback-footer">
                <span className="feedback-date">
                  {formatDate(feedback.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;