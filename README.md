# AI Chat Interface with DeepSeek

A modern, full-stack chat application powered by DeepSeek AI, built with React (frontend) and Express (backend).

## 🚀 Features

- **Real-time AI Chat**: Powered by DeepSeek's advanced language model
- **Multiple Conversations**: Create, manage, and switch between different chat sessions
- **Conversation Management**: Auto-generated titles, message history, and conversation deletion
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Optimistic Updates**: Immediate UI feedback for better user experience

## 🏗️ Architecture

```
project/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   └── ...
├── backend/               # Backend (Express + Node.js)
│   ├── services/          # DeepSeek API integration
│   ├── routes/            # API routes
│   └── server.js          # Main server file
└── ...
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- DeepSeek API key

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run install:backend
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# Copy the example environment file
cp backend/env.example backend/.env
```

Edit `backend/.env` and add your DeepSeek API key:

```env
# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Running the Application

#### Option 1: Run Everything at Once

```bash
npm run dev:full
```

#### Option 2: Run Separately

```bash
# Terminal 1 - Frontend (runs on http://localhost:5173)
npm run dev:frontend

# Terminal 2 - Backend (runs on http://localhost:3001)
npm run dev:backend
```

### 4. Testing the Setup

1. **Frontend**: Visit [http://localhost:5173](http://localhost:5173)
2. **Backend Health Check**: Visit [http://localhost:3001/health](http://localhost:3001/health)

## 📡 API Endpoints

### Conversations

- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get specific conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages

- `POST /api/conversations/:id/messages` - Send message to conversation

### Health Check

- `GET /health` - Server health status

## 🎯 Usage

1. **Start a New Chat**: Click the "New Chat" button in the sidebar
2. **Send Messages**: Type your message and press Enter or click Send
3. **Switch Conversations**: Click on any conversation in the sidebar
4. **Delete Conversations**: Hover over a conversation and click the trash icon

## 🔧 Development

### Frontend Development

- Built with React 18, TypeScript, and Tailwind CSS
- Uses Vite for fast development and building
- Phosphor Icons for UI icons

### Backend Development

- Express.js server with CORS enabled
- DeepSeek API integration
- In-memory conversation storage (upgrade to database for production)
- Comprehensive error handling

### Key Files

- `src/hooks/useChat.ts` - Main chat logic and API integration
- `backend/services/deepseekService.js` - DeepSeek API wrapper
- `backend/routes/chat.js` - Chat API endpoints
- `backend/server.js` - Express server configuration

## 📦 Available Scripts

### Frontend

- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production

### Backend

- `npm run dev:backend` - Start backend development server
- `npm run start:backend` - Start backend production server

### Full-Stack

- `npm run dev:full` - Start both frontend and backend
- `npm run install:all` - Install all dependencies

## 🚨 Troubleshooting

### Common Issues

1. **"DEEPSEEK_API_KEY is required" Error**

   - Make sure you've created `backend/.env` file
   - Verify your DeepSeek API key is correct

2. **CORS Errors**

   - Ensure backend is running on port 3001
   - Check FRONTEND_URL in backend/.env

3. **"Failed to load conversations" Error**

   - Verify backend server is running
   - Check network connectivity between frontend and backend

4. **API Rate Limiting**
   - DeepSeek may have rate limits
   - Check your API key quota and usage

### Debug Mode

Set `NODE_ENV=development` in backend/.env for detailed error logs.

## 🔐 Security Notes

- Never commit your `.env` file with real API keys
- Use environment variables for production deployment
- Consider implementing rate limiting for production use
- Add authentication/authorization for multi-user scenarios

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Happy Chatting! 🎉**
