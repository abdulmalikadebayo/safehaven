import React, { useState, useEffect } from 'react';
import './App.css';
import VoiceChat from './components/VoiceChat';
import NameInput from './components/NameInput';
import { register, login, getMe } from './services/api';

function App() {
  const [selectedVoice, setSelectedVoice] = useState('tayo');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
          if (userData.voice_preference) {
            setSelectedVoice(userData.voice_preference);
          }
        } catch (error) {
          console.log('Authentication failed, clearing token:', error);
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    // Load saved voice preference
    const savedVoice = localStorage.getItem('selected_voice');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }

    checkAuth();
  }, []);

  const handleNameSubmit = async (fullName) => {
    try {
      // Try to login first
      let response;
      try {
        response = await login(fullName);
      } catch (loginError) {
        // If login fails, register new user
        response = await register(fullName);
      }

      // Save token and user data
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      
      if (response.user.voice_preference) {
        setSelectedVoice(response.user.voice_preference);
        localStorage.setItem('selected_voice', response.user.voice_preference);
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to authenticate');
    }
  };

  const handleVoiceChange = (voiceId) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('selected_voice', voiceId);
  };

  if (isLoading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          color: '#667eea' 
        }}>
          Loading...
        </div>
      </div>
    );
  }

  console.log('App state:', { user, isLoading });

  return (
    <div className="App">
      {!user ? (
        <NameInput onSubmit={handleNameSubmit} />
      ) : (
        <VoiceChat 
          selectedVoice={selectedVoice} 
          onVoiceChange={handleVoiceChange}
          user={user}
        />
      )}
    </div>
  );
}

export default App;
