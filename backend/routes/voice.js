import express from 'express';
import VoiceRecognitionService from '../services/voiceRecognitionService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const voiceService = new VoiceRecognitionService();

// Store active WebSocket connections for real-time updates
const activeConnections = new Map();

/**
 * POST /api/voice/start-session
 * Start a new voice recognition session
 */
router.post('/start-session', async (req, res) => {
  try {
    // Use agent ID from environment variables - frontend doesn't need to know about it
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    
    console.log(`🎤 Voice session start request`);
    console.log(`🔧 Environment check:`, {
      hasApiKey: !!process.env.ELEVENLABS_API_KEY,
      hasAgentId: !!agentId,
      agentId: agentId
    });
    
    if (!agentId) {
      console.error('❌ No agent ID configured in environment variables');
      return res.status(500).json({ 
        error: 'Voice recognition service not properly configured' 
      });
    }

    const sessionId = uuidv4();
    console.log(`🆔 Generated session ID: ${sessionId}`);
    
    // Define message handler
    const onMessage = (message) => {
      // Send message to frontend via WebSocket if connected
      const connection = activeConnections.get(sessionId);
      if (connection && connection.readyState === 1) { // WebSocket.OPEN
        connection.send(JSON.stringify(message));
      }
    };

    // Define error handler
    const onError = (error) => {
      console.error(`Voice session ${sessionId} error:`, error);
      const connection = activeConnections.get(sessionId);
      if (connection && connection.readyState === 1) {
        connection.send(JSON.stringify({
          type: 'error',
          message: error.message,
          sessionId
        }));
      }
    };

    const result = await voiceService.startVoiceSession(
      sessionId, 
      agentId, 
      onMessage, 
      onError
    );

    console.log(`✅ Voice session started successfully: ${sessionId}`);
    res.json({
      success: true,
      sessionId,
      message: 'Voice recognition session started'
    });

  } catch (error) {
    console.error('❌ Error starting voice session:', error);
    res.status(500).json({
      error: 'Failed to start voice recognition session',
      details: error.message
    });
  }
});

/**
 * POST /api/voice/send-audio
 * Send audio data to a voice recognition session
 */
router.post('/send-audio', async (req, res) => {
  try {
    const { sessionId, audioData } = req.body;
    
    if (!sessionId || !audioData) {
      return res.status(400).json({ 
        error: 'Session ID and audio data are required' 
      });
    }

    voiceService.sendAudioData(sessionId, audioData);
    
    res.json({
      success: true,
      message: 'Audio data sent'
    });

  } catch (error) {
    console.error('Error sending audio data:', error);
    res.status(500).json({
      error: 'Failed to send audio data',
      details: error.message
    });
  }
});

/**
 * POST /api/voice/end-session
 * End a voice recognition session
 */
router.post('/end-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }

    const result = voiceService.endVoiceSession(sessionId);
    
    // Clean up WebSocket connection
    const connection = activeConnections.get(sessionId);
    if (connection) {
      connection.close();
      activeConnections.delete(sessionId);
    }
    
    res.json(result);

  } catch (error) {
    console.error('Error ending voice session:', error);
    res.status(500).json({
      error: 'Failed to end voice recognition session',
      details: error.message
    });
  }
});

/**
 * GET /api/voice/status
 * Get voice recognition service status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    activeSessions: voiceService.getActiveSessionsCount(),
    activeConnections: activeConnections.size
  });
});

/**
 * WebSocket upgrade handler for real-time voice communication
 */
const handleWebSocketUpgrade = (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    ws.close(1008, 'Session ID required');
    return;
  }

  console.log(`WebSocket connected for session: ${sessionId}`);
  activeConnections.set(sessionId, ws);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'audio_chunk') {
        // Forward audio data to ElevenLabs
        voiceService.sendAudioData(sessionId, message.audioData);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket disconnected for session: ${sessionId}`);
    activeConnections.delete(sessionId);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    activeConnections.delete(sessionId);
  });
};

// Clean up old sessions every 5 minutes
setInterval(() => {
  voiceService.cleanupOldSessions();
}, 5 * 60 * 1000);

export { router as default, handleWebSocketUpgrade }; 