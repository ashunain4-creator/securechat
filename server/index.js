const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
let adminApp;
try {
  const serviceAccount = require('./firebase-service-account.json');
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log('⚠️  Firebase Admin SDK not configured. Please add your firebase-service-account.json file.');
  console.log('📝 For now, the server will run without Firebase authentication.');
  console.log('🔧 To set up Firebase:');
  console.log('   1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('   2. Generate a new private key');
  console.log('   3. Replace server/firebase-service-account.json with the downloaded file');
  
  // Initialize without Firebase for development
  adminApp = admin.initializeApp({
    projectId: 'demo-project'
  });
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Check if Firebase is properly configured
    if (!admin.apps.length || !admin.apps[0].options.credential) {
      return res.status(503).json({ 
        error: 'Firebase not configured. Please set up your firebase-service-account.json file.' 
      });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profile data retrieved successfully',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name || 'User'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
}); 