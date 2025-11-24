import React, { useState, useRef, useEffect } from 'react';
import './VoiceInterface.css';
import { voiceAPI } from '../services/api';

function VoiceInterface({ userId, userProfile }) {
  const [mode, setMode] = useState('voice_to_voice');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        text: "Hello! I'm here to support your wellness journey. How are you feeling today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioMessage(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioMessage = async (audioBlob) => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await voiceAPI.interact({
        audio_file: audioBlob,
        mode: mode,
        user_id: userId,
      });

      // Add user message
      if (response.transcript) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'user',
            text: response.transcript,
            timestamp: new Date(),
          },
        ]);
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.response_text,
          audio_url: response.audio_url,
          suggested_habit: response.suggested_habit,
          timestamp: new Date(),
        },
      ]);

      // Play audio if available
      if (response.audio_url && audioRef.current) {
        audioRef.current.src = response.audio_url;
        audioRef.current.play();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process message');
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    setError('');

    // Add user message immediately
    const userMessage = textInput;
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userMessage,
        timestamp: new Date(),
      },
    ]);
    setTextInput('');

    try {
      const response = await voiceAPI.interact({
        text_input: userMessage,
        mode: mode,
        user_id: userId,
      });

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.response_text,
          audio_url: response.audio_url,
          suggested_habit: response.suggested_habit,
          timestamp: new Date(),
        },
      ]);

      // Play audio if available
      if (response.audio_url && audioRef.current) {
        audioRef.current.src = response.audio_url;
        audioRef.current.play();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process message');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  return (
    <div className="voice-interface">
      <div className="interface-header">
        <h1>Wellness Assistant</h1>
        <div className="mode-selector">
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="voice_to_voice">Voice to Voice</option>
            <option value="voice_to_text">Voice to Text</option>
            <option value="text_to_voice">Text to Voice</option>
            <option value="text_to_text">Text to Text</option>
          </select>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              <p>{message.text}</p>
              {message.suggested_habit && (
                <div className="habit-suggestion">
                  <strong>💡 Suggested Activity:</strong>
                  <p>{message.suggested_habit.name}</p>
                  <small>{message.suggested_habit.description}</small>
                </div>
              )}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="message assistant processing">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="input-container">
        {(mode === 'voice_to_voice' || mode === 'voice_to_text') && (
          <button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            {isRecording ? '🔴 Stop Recording' : '🎤 Start Recording'}
          </button>
        )}

        {(mode === 'text_to_voice' || mode === 'text_to_text') && (
          <div className="text-input-group">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isProcessing}
              rows={3}
            />
            <button
              className="send-button"
              onClick={sendTextMessage}
              disabled={isProcessing || !textInput.trim()}
            >
              Send
            </button>
          </div>
        )}
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}

export default VoiceInterface;
