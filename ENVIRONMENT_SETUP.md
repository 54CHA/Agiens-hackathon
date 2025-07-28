# Environment Variables Setup Guide - CORRECTED ARCHITECTURE

## ✅ Correct Architecture

**Frontend**: Only communicates with your backend (no ElevenLabs credentials needed)
**Backend**: Handles all ElevenLabs API communication securely

## Frontend Environment Variables (.env.local) - MINIMAL

Create a `.env.local` file in the **project root** with:

```bash
# Backend API URL (only thing frontend needs to know)
VITE_API_URL=http://localhost:3001
```

**Note**: Frontend does NOT need any ElevenLabs credentials!

## Backend Environment Variables (.env) - SECURE

Your `backend/.env` file should have (✅ already configured):

```bash
# DeepSeek AI Configuration
DEEPSEEK_API_KEY=sk-3242c658ee844e069dfd5cda613d9ebc

# ElevenLabs API Configuration (BACKEND ONLY)
ELEVENLABS_API_KEY=sk_46e6d62cd0258314f8f2b40cda817173827d52080f1baa21
ELEVENLABS_AGENT_ID=FGY2WhTYpPnrIDTdsKH5

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_eEAIV0X2dvpb@ep-gentle-feather-a9fh9irs-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Configuration
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
```

## 🔐 Security Architecture

✅ **API keys stay on backend only**  
✅ **Frontend never sees ElevenLabs credentials**  
✅ **Agent ID is configured server-side**  
✅ **No sensitive data in client code**  

## Data Flow

1. **Frontend** → Captures audio from microphone
2. **Frontend** → Sends audio to YOUR backend via WebSocket
3. **Backend** → Communicates with ElevenLabs using API keys
4. **Backend** → Returns transcription to frontend
5. **Frontend** → Displays transcribed text

## ❌ What NOT to do

- ❌ Don't put ElevenLabs API keys in frontend
- ❌ Don't put agent IDs in frontend environment variables  
- ❌ Don't make direct calls from frontend to ElevenLabs
- ❌ Don't expose any ElevenLabs credentials to client

## ✅ What's Fixed

✅ Removed `agentId` prop from frontend components  
✅ Backend handles agent ID from environment variables  
✅ Frontend only communicates with backend  
✅ All ElevenLabs logic is server-side only 