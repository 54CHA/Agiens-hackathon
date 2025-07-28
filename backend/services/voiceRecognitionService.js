import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import WebSocket from 'ws';

class VoiceRecognitionService {
  constructor() {
    this.elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });
    this.conversations = new Map(); // Store active conversations
  }

  /**
   * Create a signed URL for WebSocket connection to ElevenLabs
   */
  async createSignedUrl(agentId) {
    try {
      console.log(`🔗 Creating signed URL for agent: ${agentId}`);
      console.log(`🔑 Using API key: ${process.env.ELEVENLABS_API_KEY ? '***configured***' : 'NOT SET'}`);
      
      const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`;
      console.log(`📡 Request URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📊 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ElevenLabs API Error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to get signed URL: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Signed URL created successfully`);
      return data.signed_url;
    } catch (error) {
      console.error('❌ Error creating signed URL:', error);
      throw error;
    }
  }

  /**
   * Start a voice recognition session
   */
  async startVoiceSession(sessionId, agentId, onMessage, onError) {
    try {
      const signedUrl = await this.createSignedUrl(agentId);
      
      const ws = new WebSocket(signedUrl);
      
      ws.on('open', () => {
        console.log(`Voice session ${sessionId} connected`);
        
        // Send conversation initiation
        ws.send(JSON.stringify({
          type: 'conversation_initiation_client_data',
          conversation_config_override: {
            agent: {
              prompt: {
                prompt: "You are a voice transcription assistant. Listen to what the user says and transcribe it accurately. Respond very briefly to acknowledge you understood."
              }
            }
          }
        }));
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('Received message:', message.type);

          // Handle different message types
          if (message.type === 'user_transcript') {
            const transcript = message.user_transcription_event?.user_transcript;
            if (transcript) {
              onMessage({
                type: 'transcript',
                text: transcript,
                sessionId
              });
            }
          } else if (message.type === 'agent_response') {
            const response = message.agent_response_event?.agent_response;
            if (response) {
              onMessage({
                type: 'agent_response',
                text: response,
                sessionId
              });
            }
          } else if (message.type === 'ping') {
            // Respond to ping to keep connection alive
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'pong',
                  event_id: message.ping_event.event_id
                }));
              }
            }, message.ping_event.ping_ms || 0);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          onError(error);
        }
      });

      ws.on('error', (error) => {
        console.error(`Voice session ${sessionId} error:`, error);
        onError(error);
      });

      ws.on('close', () => {
        console.log(`Voice session ${sessionId} closed`);
        this.conversations.delete(sessionId);
      });

      // Store the WebSocket connection
      this.conversations.set(sessionId, {
        ws,
        agentId,
        createdAt: new Date()
      });

      return { success: true, sessionId };
    } catch (error) {
      console.error('Error starting voice session:', error);
      throw error;
    }
  }

  /**
   * Send audio data to the voice recognition session
   */
  sendAudioData(sessionId, audioData) {
    const conversation = this.conversations.get(sessionId);
    
    if (!conversation || conversation.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Voice session not active');
    }

    conversation.ws.send(JSON.stringify({
      user_audio_chunk: audioData
    }));
  }

  /**
   * End a voice recognition session
   */
  endVoiceSession(sessionId) {
    const conversation = this.conversations.get(sessionId);
    
    if (conversation) {
      conversation.ws.close();
      this.conversations.delete(sessionId);
      return { success: true };
    }
    
    return { success: false, error: 'Session not found' };
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount() {
    return this.conversations.size;
  }

  /**
   * Clean up old sessions (called periodically)
   */
  cleanupOldSessions(maxAgeMinutes = 30) {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    
    for (const [sessionId, conversation] of this.conversations.entries()) {
      if (conversation.createdAt < cutoff) {
        console.log(`Cleaning up old session: ${sessionId}`);
        conversation.ws.close();
        this.conversations.delete(sessionId);
      }
    }
  }
}

export default VoiceRecognitionService; 