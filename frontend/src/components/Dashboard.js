import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ refreshTrigger }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all feedback
      const feedbackResponse = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/feedback`
      );
      setFeedbackList(feedbackResponse.data);

      // Get dashboard stats
      const statsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard`
      );
      setStats(statsResponse.data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCourseStats = () => {
    const courseMap = {};

    feedbackList.forEach(feedback => {
      if (!courseMap[feedback.courseCode]) {
        courseMap[feedback.courseCode] = {
          courseCode: feedback.courseCode,
          ratings: [],
          count: 0
        };
      }
      courseMap[feedback.courseCode].ratings.push(feedback.rating);
      courseMap[feedback.courseCode].count++;
    });

    return Object.values(courseMap)
      .map(course => ({
        courseCode: course.courseCode,
        count: course.count,
        averageRating: (course.ratings.reduce((a, b) => a + b, 0) / course.ratings.length).toFixed(2),
        highestRating: Math.max(...course.ratings),
        lowestRating: Math.min(...course.ratings)
      }))
      .sort((a, b) => b.averageRating - a.averageRating);
  };

  if (loading) return <div className="dashboard-container">Loading dashboard...</div>;
  if (error) return <div className="dashboard-container">{error}</div>;

  const courseStats = getCourseStats();

  return (
    <div className="dashboard-container">
      <h2>Feedback Dashboard</h2>

      {/* Overall Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Feedback</h3>
          <p className="stat-number">{stats?.totalFeedback || 0}</p>
        </div>

        <div className="stat-card highlight">
          <h3>Overall Average Rating</h3>
          <p className="stat-number">
            {stats?.averageRating && !isNaN(stats.averageRating)
              ? Number(stats.averageRating).toFixed(2)
              : '0.00'}
          </p>
        </div>

        <div className="stat-card">
          <h3>Courses Reviewed</h3>
          <p className="stat-number">{courseStats.length}</p>
        </div>

        <div className="stat-card">
          <h3>Highest Rating</h3>
          <p className="stat-number">{stats?.highestRating || 0}/5</p>
        </div>
      </div>

      {/* Per-Course Statistics */}
      {courseStats.length > 0 && (
        <>
          <h3 className="section-title">Course Performance</h3>
          <div className="course-stats-grid">
            {courseStats.map((course, index) => (
              <div key={course.courseCode} className="course-card">
                <div className="course-header">
                  <span className="course-badge">{course.courseCode}</span>
                  <span className="course-rank">#{index + 1}</span>
                </div>
                <div className="course-body">
                  <div className="course-rating">
                    <span className="rating-large">{course.averageRating}</span>
                    <span className="rating-label">/5.0</span>
                  </div>
                  <div className="course-details">
                    <div className="detail-item">
                      <span className="detail-label">Responses:</span>
                      <span className="detail-value">{course.count}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Range:</span>
                      <span className="detail-value">
                        {course.lowestRating} - {course.highestRating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="dashboard-info">
        <h3>Insights & Analytics</h3>
        <p>
          This dashboard provides detailed feedback analysis for each course.
          Courses are ranked by average rating to help identify top performers and areas for improvement.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
