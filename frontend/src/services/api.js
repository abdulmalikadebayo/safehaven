import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Authentication APIs
export const register = async (fullName) => {
  const response = await api.post('/auth/register/', { full_name: fullName });
  return response.data;
};

export const login = async (fullName) => {
  const response = await api.post('/auth/login/', { full_name: fullName });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me/');
  return response.data;
};

export const sendVoiceMessage = async (audioBlob, voicePreference = 'tayo') => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('voice_preference', voicePreference);

  try {
    const response = await api.post('/voice_input/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });

    // Check if response is JSON (TTS failed) or audio
    const contentType = response.headers['content-type'];
    
    if (contentType && contentType.includes('application/json')) {
      // TTS failed, parse JSON
      const text = await response.data.text();
      const jsonData = JSON.parse(text);
      return {
        user_query: jsonData.user_query || jsonData.transcript,
        transcript: jsonData.transcript,
        response_text: jsonData.response_text,
        audio_url: null,
      };
    } else {
      // Audio response - Django sends headers in lowercase with hyphens
      const headers = response.headers;
      
      console.log('🔍 DEBUG - Full response object:', response);
      console.log('🔍 DEBUG - Response headers object:', headers);
      console.log('🔍 DEBUG - All header keys:', Object.keys(headers));
      
      // Check if headers are base64 encoded
      const isBase64 = headers['x-encoding'] === 'base64';
      
      console.log('🔐 Is base64 encoded?', isBase64);
      console.log('🔐 x-encoding header:', headers['x-encoding']);
      
      // Helper function to decode base64 if needed
      const decodeHeader = (value) => {
        if (!value) return '';
        console.log('🔓 Decoding value (first 50 chars):', value.substring(0, 50));
        if (isBase64) {
          try {
            const decoded = atob(value);
            console.log('✅ Decoded successfully (first 50 chars):', decoded.substring(0, 50));
            return decoded;
          } catch (e) {
            console.error('❌ Failed to decode base64 header:', e);
            return value;
          }
        }
        console.log('⚠️ Not base64, returning as-is');
        return value;
      };
      
      // Try different case variations
      const userQuery = decodeHeader(
        headers['x-user-query'] || headers['X-User-Query'] || 
        headers['xuserquery'] || headers['XUSERQUERY'] || ''
      );
      const transcript = decodeHeader(
        headers['x-transcript'] || headers['X-Transcript'] || 
        headers['xtranscript'] || headers['XTRANSCRIPT'] || ''
      );
      const responseText = decodeHeader(
        headers['x-response-text'] || headers['X-Response-Text'] || 
        headers['xresponsetext'] || headers['XRESPONSETEXT'] || ''
      );
      const audioUrl = URL.createObjectURL(response.data);

      console.log('📋 Extracted values:', {
        userQuery,
        transcript,
        responseText,
        hasAudio: !!audioUrl
      });

      return {
        user_query: userQuery,
        transcript: transcript,
        response_text: responseText,
        audio_url: audioUrl,
      };
    }
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to process message');
  }
};

export const sendTextMessage = async (text, voicePreference = 'tayo') => {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('voice_preference', voicePreference);

  try {
    const response = await api.post('/voice_input/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });

    // Check if response is JSON (TTS failed) or audio
    const contentType = response.headers['content-type'];
    
    if (contentType && contentType.includes('application/json')) {
      // TTS failed, parse JSON
      const text = await response.data.text();
      const jsonData = JSON.parse(text);
      return {
        user_query: jsonData.user_query || text,
        transcript: jsonData.transcript || text,
        response_text: jsonData.response_text,
        audio_url: null,
      };
    } else {
      // Audio response
      const headers = response.headers;
      const isBase64 = headers['x-encoding'] === 'base64';
      
      const decodeHeader = (value) => {
        if (!value) return '';
        if (isBase64) {
          try {
            return atob(value);
          } catch (e) {
            console.error('Failed to decode base64 header:', e);
            return value;
          }
        }
        return value;
      };
      
      const userQuery = decodeHeader(headers['x-user-query'] || headers['x-transcript'] || '') || text;
      const transcript = decodeHeader(headers['x-transcript'] || '') || text;
      const responseText = decodeHeader(headers['x-response-text'] || '');
      const audioUrl = URL.createObjectURL(response.data);

      return {
        user_query: userQuery,
        transcript: transcript,
        response_text: responseText,
        audio_url: audioUrl,
      };
    }
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to process message');
  }
};

export default api;
