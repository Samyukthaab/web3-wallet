const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize database
const db = require('./database');

// Initialize email service
const { initializeEmailService } = require('./services/emailService');
initializeEmailService();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transaction');

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Web3 Wallet API is running' });
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { sendTestEmail } = require('./services/emailService');
    const { email } = req.body;
    
    const result = await sendTestEmail(email || 'saravanaguhan123@gmail.com');
    
    res.json({
      success: true,
      result,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.use('/api/wallet', walletRoutes);
app.use('/api/transaction', transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

module.exports = app;