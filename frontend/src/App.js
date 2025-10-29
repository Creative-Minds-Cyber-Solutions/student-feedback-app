import React, { useState } from 'react';
import './App.css';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFeedbackSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Student Feedback Application</h1>
        <p>Share your course feedback and help improve learning</p>
      </header>

      <nav className="nav-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'form' ? 'active' : ''}
          onClick={() => setActiveTab('form')}
        >
          Submit Feedback
        </button>
        <button 
          className={activeTab === 'view' ? 'active' : ''}
          onClick={() => setActiveTab('view')}
        >
          View Feedback
        </button>
      </nav>

      <div className="content">
        {activeTab === 'dashboard' && <Dashboard refreshTrigger={refreshTrigger} />}
        {activeTab === 'form' && <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />}
        {activeTab === 'view' && <FeedbackList refreshTrigger={refreshTrigger} />}
      </div>

      <footer className="app-footer">
        <p>© 2025 Student Feedback System | Limkokwing University</p>
      </footer>
    </div>
  );
}

export default App;