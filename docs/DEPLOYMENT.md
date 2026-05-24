# Deployment Guide — ResumeAI Pro

## Prerequisites
- GitHub repository with your code
- MongoDB Atlas account
- Google Gemini API key
- Vercel account (frontend)
- Render or Railway account (backend)

---

## 1. MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster (M0 free tier)
3. Create a database user with a strong password
4. Add `0.0.0.0/0` to Network Access (for cloud deployment)
5. Get your connection string: `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/resume-analyzer`

---

## 2. Backend Deployment (Render)

1. Go to [render.com](https://render.com) and connect your GitHub repo
2. Create a new **Web Service**
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
4. Add environment variables:
   - `PORT` = `10000`
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = a strong random string
   - `JWT_EXPIRE` = `7d`
   - `GEMINI_API_KEY` = your API key
   - `CLIENT_URL` = your Vercel frontend URL
5. Deploy!

---

## 3. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://your-app.onrender.com/api`)
4. Update `client/src/services/api.js` baseURL to use `import.meta.env.VITE_API_URL` for production
5. Deploy!

---

## 4. Post-Deployment Checklist

- [ ] Test signup/login flow
- [ ] Test resume upload
- [ ] Test ATS analysis
- [ ] Test job description matching
- [ ] Test AI improvements (requires valid Gemini API key)
- [ ] Verify dark/light mode
- [ ] Test on mobile devices

---

## Environment Variables Summary

### Server (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| PORT | Yes | Server port (5000 local, 10000 Render) |
| MONGODB_URI | Yes | MongoDB connection string |
| JWT_SECRET | Yes | Secret for JWT signing |
| JWT_EXPIRE | No | Token expiry (default: 7d) |
| GEMINI_API_KEY | Yes* | Google Gemini API key (*AI features only) |
| CLIENT_URL | No | Frontend URL for CORS |

### Client (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_URL | No | Backend API URL (uses proxy in dev) |
