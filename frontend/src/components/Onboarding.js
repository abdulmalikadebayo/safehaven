import React, { useState, useEffect } from 'react';
import './Onboarding.css';
import { coreAPI, voiceAPI } from '../services/api';

function Onboarding({ onComplete }) {
  const [step, setStep] = useState('disclaimer');
  const [disclaimer, setDisclaimer] = useState('');
  const [voices, setVoices] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    voice_preference: 'neutral_global',
    locale: 'en_US',
    accept_disclaimer: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDisclaimer();
    loadVoices();
  }, []);

  const loadDisclaimer = async () => {
    try {
      const data = await coreAPI.getDisclaimer();
      setDisclaimer(data.disclaimer);
    } catch (err) {
      setError('Failed to load disclaimer');
    }
  };

  const loadVoices = async () => {
    try {
      const data = await voiceAPI.getVoices();
      setVoices(data.voices);
    } catch (err) {
      console.error('Failed to load voices', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDisclaimerAccept = () => {
    if (formData.accept_disclaimer) {
      setStep('details');
    } else {
      setError('Please accept the disclaimer to continue');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await coreAPI.onboard(formData);
      localStorage.setItem('user_id', response.user_id);
      localStorage.setItem('user_profile', JSON.stringify(response.profile));
      onComplete(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'disclaimer') {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card">
          <h1>Welcome to Your Wellness Assistant</h1>
          <div className="disclaimer-box">
            <pre>{disclaimer}</pre>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="accept_disclaimer"
              name="accept_disclaimer"
              checked={formData.accept_disclaimer}
              onChange={handleInputChange}
            />
            <label htmlFor="accept_disclaimer">
              I understand and accept the above disclaimer
            </label>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button
            className="primary-button"
            onClick={handleDisclaimerAccept}
            disabled={!formData.accept_disclaimer}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1>Let's Get Started</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="voice_preference">Voice Preference</label>
            <select
              id="voice_preference"
              name="voice_preference"
              value={formData.voice_preference}
              onChange={handleInputChange}
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="locale">Language/Locale</label>
            <select
              id="locale"
              name="locale"
              value={formData.locale}
              onChange={handleInputChange}
            >
              <option value="en_US">English (US)</option>
              <option value="en_GB">English (UK)</option>
              <option value="en_NG">English (Nigeria)</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Setting up...' : 'Start My Wellness Journey'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;
