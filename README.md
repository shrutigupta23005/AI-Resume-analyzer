# 🚀 ResumeAI Pro — AI-Powered Resume Analyzer

<div align="center">

**Full-Stack SaaS Application for Resume Analysis, ATS Scoring, and AI-Powered Improvements**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)](https://ai.google.dev/)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)

---

## ✨ Features

### 🔐 Authentication
- Secure JWT-based user registration & login
- Password hashing with bcrypt (12 rounds)
- Protected routes and session persistence
- Rate limiting on auth endpoints

### 📄 Resume Management
- Drag-and-drop PDF upload with file validation
- PDF preview before uploading
- Automatic text extraction using pdf-parse
- Section detection (Contact, Summary, Experience, Education, Skills, Projects, Certifications)
- Resume history with delete functionality

### 📊 ATS Compatibility Analysis
- **10-category scoring engine** with weighted percentages:
  - Formatting (15%) — structure, bullet points, ATS-safe formatting
  - Section Completeness (15%) — required sections check
  - Keyword Optimization (15%) — technical & soft skills density
  - Action Verbs (10%) — strong verb usage analysis
  - Readability (10%) — sentence length, paragraph structure
  - Skills Section (10%) — technical & soft skills coverage
  - Experience Quality (10%) — quantified achievements, dates
  - Grammar & Spelling (5%) — consistency, common errors
  - Length Optimization (5%) — word count optimization
  - Professionalism (5%) — email, LinkedIn, phone number
- Animated circular score gauge with color coding
- Expandable category details with specific findings
- Strengths, weaknesses, and actionable recommendations
- **Downloadable PDF analysis reports**

### 💼 Job Description Matching
- Paste any job description to compare
- Match percentage with keyword analysis
- Matched vs missing keywords visualization
- Skills gap analysis (matched, missing, extra)
- Experience requirement matching
- AI-generated tailoring suggestions
- **Downloadable PDF match reports**

### 🤖 AI-Powered Improvements (Google Gemini)
- Professional summary rewrite
- Bullet point improvements (original → improved)
- Grammar fix suggestions
- Action verb recommendations
- Missing skills identification
- Job-specific tailoring suggestions
- One-click copy to clipboard

### 🎨 Modern UI/UX
- **Glassmorphism design** with backdrop blur effects
- Dark/light mode with system preference detection
- Smooth Framer Motion animations throughout
- Responsive layout (mobile, tablet, desktop)
- Inter typography from Google Fonts
- Custom gradient buttons and cards
- Loading skeletons and spinner animations
- Toast notifications for all actions

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with hooks |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **React Dropzone** | Drag & drop file uploads |
| **React Hot Toast** | Toast notifications |
| **React Icons** | Icon library (Heroicons) |
| **Recharts** | Charts & data visualization |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **pdf-parse** | PDF text extraction |
| **PDFKit** | PDF report generation |
| **Multer** | File upload handling |
| **Helmet** | Security headers |
| **Morgan** | HTTP request logging |
| **express-rate-limit** | API rate limiting |
| **express-validator** | Input validation |
| **@google/generative-ai** | Gemini AI integration |

---

## 📁 Project Structure

```
ai-resume-analyzer/
├── client/                     # React Frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── DashboardLayout.jsx   # Sidebar + header layout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Auth state management
│   │   │   └── ThemeContext.jsx          # Dark/light mode
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx           # Public landing page
│   │   │   ├── LoginPage.jsx             # Login form
│   │   │   ├── SignupPage.jsx            # Registration form
│   │   │   ├── DashboardPage.jsx         # Stats overview
│   │   │   ├── UploadPage.jsx            # Resume upload + preview
│   │   │   ├── AnalysisPage.jsx          # ATS score report
│   │   │   ├── JobMatchPage.jsx          # JD matching
│   │   │   ├── AIImprovementsPage.jsx    # AI suggestions
│   │   │   └── HistoryPage.jsx           # History & management
│   │   ├── services/
│   │   │   └── api.js                    # Axios instance + interceptors
│   │   ├── App.jsx                       # Routes configuration
│   │   ├── main.jsx                      # App entry point
│   │   └── index.css                     # Global styles + design system
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/
│   │   ├── db.js                         # MongoDB connection
│   │   └── env.js                        # Environment variables
│   ├── controllers/
│   │   ├── authController.js             # Register, login, profile
│   │   ├── resumeController.js           # Upload, CRUD operations
│   │   ├── analysisController.js         # ATS scoring, job matching, reports
│   │   └── aiController.js               # AI improvement endpoints
│   ├── middleware/
│   │   ├── auth.js                       # JWT verification
│   │   ├── errorHandler.js               # Global error handling
│   │   ├── rateLimiter.js                # Rate limiting configs
│   │   ├── upload.js                     # Multer PDF upload
│   │   └── validate.js                   # Input validation rules
│   ├── models/
│   │   ├── User.js                       # User schema + password hashing
│   │   ├── Resume.js                     # Resume metadata + extracted text
│   │   ├── Analysis.js                   # ATS analysis results
│   │   └── JobMatch.js                   # Job matching results
│   ├── routes/
│   │   ├── authRoutes.js                 # /api/auth/*
│   │   ├── resumeRoutes.js               # /api/resumes/*
│   │   ├── analysisRoutes.js             # /api/analysis/*
│   │   └── aiRoutes.js                   # /api/ai/*
│   ├── services/
│   │   ├── aiService.js                  # Gemini AI integration
│   │   ├── atsScorer.js                  # 10-category ATS scoring engine
│   │   ├── jobMatcher.js                 # Resume-JD comparison engine
│   │   ├── pdfParser.js                  # PDF text extraction
│   │   └── reportGenerator.js            # PDF report generation
│   ├── uploads/                          # Uploaded resume files
│   ├── server.js                         # Express entry point
│   ├── .env.example                      # Environment template
│   └── package.json
│
├── docs/                       # Documentation
├── package.json                # Root scripts (concurrently)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** (local install or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- **Git** ([Download](https://git-scm.com/))
- **Google Gemini API Key** (optional, for AI features — [Get free key](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "project AI resume analyzer"
   ```

2. **Install all dependencies** (root + server + client)
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   # Copy the template
   cp server/.env.example server/.env
   
   # Edit with your values (see Environment Variables section below)
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   npm run dev
   ```
   This starts both the backend (port 5000) and frontend (port 5173) concurrently.

5. **Open the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health

---

## 🔧 Environment Variables

Create `server/.env` with the following:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (replace with your Atlas URI for production)
MONGODB_URI=mongodb://localhost:27017/resume-analyzer

# JWT (use a strong random string in production)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Google Gemini AI (optional - AI features won't work without this)
GEMINI_API_KEY=your_gemini_api_key_here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Getting API Keys

| Service | How to Get | Cost |
|---------|-----------|------|
| **MongoDB Atlas** | [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create cluster → Get connection string | Free tier available |
| **Gemini API** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → Create API key | Free tier (60 req/min) |

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create account | ❌ |
| POST | `/login` | Login | ❌ |
| GET | `/me` | Get current user | ✅ |

#### Resumes (`/api/resumes`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/upload` | Upload PDF resume | ✅ |
| GET | `/` | List all resumes | ✅ |
| GET | `/:id` | Get single resume | ✅ |
| DELETE | `/:id` | Delete resume | ✅ |
| GET | `/:id/download` | Download PDF file | ✅ |

#### Analysis (`/api/analysis`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/:resumeId` | Run ATS analysis | ✅ |
| GET | `/` | List all analyses | ✅ |
| GET | `/:id` | Get analysis result | ✅ |
| GET | `/:id/report` | Download PDF report | ✅ |
| POST | `/:resumeId/match` | Match against job description | ✅ |
| GET | `/matches` | List all job matches | ✅ |
| GET | `/match/:id` | Get match result | ✅ |
| GET | `/match/:id/report` | Download match PDF report | ✅ |
| GET | `/dashboard/stats` | Get dashboard statistics | ✅ |

#### AI (`/api/ai`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/:resumeId/improve` | Get AI improvements | ✅ |
| POST | `/rewrite-bullets` | Rewrite bullet points | ✅ |
| POST | `/:resumeId/summary` | Generate AI summary | ✅ |
| POST | `/:resumeId/job-suggestions` | Get job-specific suggestions | ✅ |

### Request/Response Examples

<details>
<summary><strong>Register User</strong></summary>

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```
</details>

<details>
<summary><strong>Upload Resume</strong></summary>

```bash
POST /api/resumes/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form field: resume = <PDF file>
```
</details>

<details>
<summary><strong>Run ATS Analysis</strong></summary>

```bash
POST /api/analysis/<resumeId>
Authorization: Bearer <token>
```

Response includes `overallScore`, `categoryScores[]`, `strengths[]`, `weaknesses[]`, `recommendations[]`.
</details>

---

## 🚢 Deployment

### Frontend → Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to client: `cd client`
3. Deploy:
   ```bash
   vercel --prod
   ```
4. Set environment variable in Vercel dashboard:
   - `VITE_API_URL` = `https://your-backend-url.com/api`

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Settings:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Root Directory**: (leave blank)
4. Add environment variables in Render dashboard:
   - `PORT`, `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`

### Backend → Railway

1. Create a new project on [railway.app](https://railway.app)
2. Connect GitHub repo
3. Set root directory to `server`
4. Add environment variables
5. Railway auto-detects Node.js and deploys

### Database → MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP (or `0.0.0.0/0` for cloud deployment)
4. Get the connection string and set it as `MONGODB_URI`

---

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (#6366f1) with purple gradient
- **Accent**: Fuchsia (#d946ef) for highlights
- **Surface**: Slate scale for backgrounds
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start both server & client |
| `npm run dev` | Same as start (development) |
| `npm run server` | Start only the backend |
| `npm run client` | Start only the frontend |
| `npm run install-all` | Install all dependencies |
| `npm run build` | Build client for production |

---

## 📄 License

MIT License — free for personal and commercial use.

---

<div align="center">
  <p>Built with ❤️ using React, Node.js, Express, MongoDB, and Google Gemini AI</p>
  <p><strong>ResumeAI Pro</strong> — Land your dream job with AI-optimized resumes</p>
</div>
