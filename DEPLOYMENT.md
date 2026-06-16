# Deployment Pre-Flight Checklist

This document serves as the final checklist before taking Hometown Hub live.

## 1. Environment Variables Validation
Ensure the production platform (e.g., Vercel, Railway, AWS) contains all environment variables listed in `.env.example`. 
- [ ] `MONGODB_URI` points to the Atlas cluster.
- [ ] `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are securely generated (e.g., via `openssl rand -hex 64`).
- [ ] `FRONTEND_URL` exactly matches the production domain (e.g., `https://hometownhub.com`).
- [ ] `NODE_ENV` is explicitly set to `production`.

## 2. Database Migration (Atlas)
- [ ] MongoDB Atlas cluster is active.
- [ ] Production servers' IP addresses are whitelisted in MongoDB Atlas Network Access.
- [ ] Database user permissions are verified.
- [ ] Compound indexes have been created/built. (Mongoose `autoIndex: false` is set in production, so you must create them manually or run a script).

## 3. Real-Time Services (Socket.IO)
- [ ] If scaling horizontally across multiple Node.js instances, install and configure `@socket.io/redis-adapter` alongside a managed Redis instance. (If using a single container on Railway or Heroku, this is not strictly required yet).

## 4. Platform Hosting Considerations
- **Frontend (Vercel):** Make sure you deploy the root directory as a Next.js app.
- **Backend (Railway/Render):** Make sure the root directory for the backend deployment is set to `/server`. Build command: `npm install && npm run build`. Start command: `npm start`.

## 5. Security & Verification
- [ ] Run the health check endpoint: `GET https://api.hometownhub.com/health` to verify `dbState: "connected"`.
- [ ] Confirm Cloudinary API keys are securely set and images render successfully via `next/image` domain mappings.
- [ ] Perform a full E2E run (Register, Login, Create Community, Create Post, Comment).
