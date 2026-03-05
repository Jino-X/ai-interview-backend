# AI Interview Platform - Backend

A robust Node.js backend API for the AI Interview Platform with real-time features, AI integration, and comprehensive interview management.

## 🚀 Live Demo

**Backend API**: [https://backend-lovat-mu-95.vercel.app](https://backend-lovat-mu-95.vercel.app)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Google OAuth (Passport.js)
- **Real-time**: Socket.io
- **AI Integration**: OpenAI GPT-4
- **File Upload**: Multer
- **Deployment**: Vercel

## 📋 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Google OAuth integration
- Role-based access control (Candidate, Interviewer, Admin)
- Secure password hashing with bcrypt

### 🎯 Interview Management
- Create and schedule interviews
- Real-time interview rooms with Socket.io
- Video/audio support via WebRTC signaling
- Interview status tracking and completion

### 🤖 AI Integration
- **Question Generation**: AI-powered interview questions by type/difficulty
- **Code Evaluation**: Real-time code assessment with scoring
- **Resume Parsing**: Extract skills, experience, and education from PDFs
- **Interview Analysis**: Comprehensive AI feedback and recommendations

### 📊 Analytics & Reporting
- Performance metrics for candidates and interviewers
- Interview statistics and trends
- Admin dashboard with platform insights

### 🔄 Real-time Features
- Live code collaboration during interviews
- Real-time chat messaging
- WebRTC signaling for video/audio
- Socket.io room management

## 🏗️ Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── passport.js        # Authentication strategies
├── middleware/
│   ├── auth.js            # JWT middleware & authorization
│   └── upload.js          # File upload configuration
├── models/
│   ├── User.js            # User schema
│   ├── Interview.js       # Interview schema
│   ├── Question.js        # Question schema
│   └── Submission.js      # Submission schema
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── users.js           # User management
│   ├── interviews.js      # Interview CRUD
│   ├── questions.js       # Question management
│   ├── submissions.js     # Code submissions
│   ├── resume.js          # Resume upload/parsing
│   ├── analytics.js       # Analytics endpoints
│   └── ai.js              # AI integration
├── services/
│   └── openaiService.js   # OpenAI API integration
├── socket/
│   └── interviewSocket.js # Socket.io handlers
├── uploads/               # File storage
├── server.js              # Main application entry
└── vercel.json           # Vercel deployment config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- OpenAI API key
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Jino-X/ai-interview-backend.git
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

4. **Configure Environment Variables**
```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=30d

# OpenAI
OPENAI_API_KEY=sk-proj-your_openai_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

5. **Start Development Server**
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Interviews
- `GET /api/interviews` - Get user interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews/:id` - Get interview details
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Delete interview
- `POST /api/interviews/:id/start` - Start interview
- `POST /api/interviews/:id/complete` - Complete interview

### Questions
- `GET /api/questions` - Get questions with filters
- `POST /api/questions` - Create question
- `POST /api/questions/bulk` - Bulk create questions
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Submissions
- `GET /api/submissions/interview/:id` - Get interview submissions
- `POST /api/submissions` - Submit code/answer
- `GET /api/submissions/:id/evaluate` - Get AI evaluation

### Resume
- `POST /api/resume/upload` - Upload resume
- `POST /api/resume/parse` - Parse resume with AI

### Analytics
- `GET /api/analytics/admin` - Admin dashboard data
- `GET /api/analytics/interviewer` - Interviewer analytics
- `GET /api/analytics/candidate` - Candidate analytics

### AI
- `POST /api/ai/generate-questions` - Generate AI questions
- `POST /api/ai/evaluate` - Evaluate code/answer with AI

## 🔌 Socket.io Events

### Client → Server
- `join-room` - Join interview room
- `leave-room` - Leave interview room
- `code-change` - Send code changes
- `chat-message` - Send chat message
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `webrtc-ice-candidate` - ICE candidate

### Server → Client
- `code-change` - Receive code changes
- `chat-message` - Receive chat message
- `webrtc-offer` - Receive WebRTC offer
- `webrtc-answer` - Receive WebRTC answer
- `webrtc-ice-candidate` - Receive ICE candidate
- `user-joined` - User joined room
- `user-left` - User left room

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Set Environment Variables**
```bash
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add OPENAI_API_KEY production
# ... add all other environment variables
```

### Environment Variables for Production
Make sure to set all environment variables in your Vercel dashboard or via CLI.

## 🧪 Development Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (if configured)
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

## 🔒 Security Features

- JWT token authentication with refresh mechanism
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization
- File upload restrictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Frontend Repository**: [AI Interview Platform Frontend](https://github.com/Jino-X/ai-interview-frontend)
