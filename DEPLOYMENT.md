# Deployment Guide

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### Frontend
```bash
# In project root
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## Production Deployment

### Backend — Railway / Render / EC2

1. Push `backend/` to your server
2. Set environment variables (from `.env.example`)
3. Use a process manager:
```bash
npm install -g pm2
pm2 start server.js --name fcm-backend
pm2 save
```

### Frontend — Vercel / Netlify

1. Set `VITE_API_URL` to your backend URL
2. Build:
```bash
npm run build
```
3. Deploy the `dist/` folder

### MongoDB

Use [MongoDB Atlas](https://www.mongodb.com/atlas) for a managed cloud database.
Set `MONGODB_URI` to your Atlas connection string.

### Environment Variables Checklist

Backend `.env`:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET` — use a long random string
- `JWT_EXPIRES_IN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Frontend `.env`:
- `VITE_API_URL`

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Set `CORS` origin to your frontend domain only
- [ ] Use a strong `JWT_SECRET`
- [ ] Never commit `.env` files
- [ ] Rotate Firebase service account keys periodically
