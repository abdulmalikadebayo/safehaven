import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      
      // Try different case variations
      const userQuery = headers['x-user-query'] || headers['X-User-Query'] || 
                        headers['xuserquery'] || headers['XUSERQUERY'] || '';
      const transcript = headers['x-transcript'] || headers['X-Transcript'] || 
                         headers['xtranscript'] || headers['XTRANSCRIPT'] || '';
      const responseText = headers['x-response-text'] || headers['X-Response-Text'] || 
                           headers['xresponsetext'] || headers['XRESPONSETEXT'] || '';
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
      const userQuery = response.headers['x-user-query'] || response.headers['x-transcript'] || text;
      const transcript = response.headers['x-transcript'] || text;
      const responseText = response.headers['x-response-text'] || '';
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
