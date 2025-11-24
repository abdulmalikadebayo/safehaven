import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './NameInput.css';

function NameInput({ onSubmit }) {
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSubmit(fullName.trim());
    } catch (err) {
      setError(err.message || 'Failed to continue. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="name-input-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="name-input-card">
        <motion.div
          className="welcome-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          🌟
        </motion.div>
        
        <h1>Welcome to SafeHaven</h1>
        <p className="subtitle">
          Your personal wellness companion. Let's begin your journey.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="fullName">What's your name?</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="continue-btn"
            disabled={isLoading || !fullName.trim()}
          >
            {isLoading ? 'Please wait...' : 'Continue'}
          </button>
        </form>
        
        <div className="powered-by">
          Powered by <strong>YarnGPT</strong> • Showcasing Nigerian-accent TTS
        </div>
      </div>
    </motion.div>
  );
}

export default NameInput;
