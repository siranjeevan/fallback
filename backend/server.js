require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const initFirebase = require('./firebase/admin');

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', process.env.FRONTEND_URL].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json());

// Init Firebase (optional — requires .env credentials)
try { initFirebase(); } catch (e) { console.warn('⚠️  Firebase init skipped:', e.message); }

// Routes
app.use('/api/admin', require('./routes/auth'));
app.use('/api', require('./routes/devices'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Connect DB and start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

async function seedAdmin() {
  const Admin = require('./models/Admin');
  const exists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (!exists) {
    await Admin.create({
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      name: 'Super Admin',
    });
    console.log('✅ Admin seeded');
  }
}
