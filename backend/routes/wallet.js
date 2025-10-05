const express = require('express');
const router = express.Router();
const db = require('../database');

// Create new wallet
router.post('/create', async (req, res) => {
  try {
    const { address, email } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_ADDRESS', message: 'Wallet address is required' }
      });
    }

    // Check if wallet already exists
    const existingWallet = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM wallets WHERE address = ?', [address], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingWallet) {
      // Update email if provided and different
      if (email && email !== existingWallet.email) {
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE wallets SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE address = ?',
            [email, address],
            function(err) {
              if (err) reject(err);
              else resolve(this);
            }
          );
        });
        console.log(`📧 Updated email for wallet ${address}: ${email}`);
      }
      
      return res.json({
        success: true,
        balance: existingWallet.balance,
        message: 'Wallet already exists'
      });
    }

    // Generate random initial balance (1-10 ETH)
    const initialBalance = Math.random() * 9 + 1; // 1.0 to 10.0 ETH

    // Create new wallet
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO wallets (address, balance, email) VALUES (?, ?, ?)',
        [address, initialBalance, email],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    console.log(`✅ Created wallet ${address} with ${initialBalance.toFixed(4)} ETH`);
    console.log(`📧 Email for wallet: ${email || 'NOT PROVIDED'}`);

    res.json({
      success: true,
      balance: initialBalance,
      message: 'Wallet created successfully'
    });

  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CREATION_FAILED', message: 'Failed to create wallet' }
    });
  }
});

// Get wallet balance
router.get('/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;

    const wallet = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM wallets WHERE address = ?', [address], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: { code: 'WALLET_NOT_FOUND', message: 'Wallet not found' }
      });
    }

    res.json({
      success: true,
      balance: wallet.balance
    });

  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({
      success: false,
      error: { code: 'BALANCE_FETCH_FAILED', message: 'Failed to get balance' }
    });
  }
});

// Update wallet email
router.put('/:address/email', async (req, res) => {
  try {
    const { address } = req.params;
    const { email } = req.body;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE wallets SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE address = ?',
        [email, address],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    res.json({
      success: true,
      message: 'Email updated successfully'
    });

  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({
      success: false,
      error: { code: 'EMAIL_UPDATE_FAILED', message: 'Failed to update email' }
    });
  }
});

// Get wallet info
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const wallet = await new Promise((resolve, reject) => {
      db.get('SELECT address, balance, email, created_at FROM wallets WHERE address = ?', [address], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: { code: 'WALLET_NOT_FOUND', message: 'Wallet not found' }
      });
    }

    res.json({
      success: true,
      wallet
    });

  } catch (error) {
    console.error('Error getting wallet info:', error);
    res.status(500).json({
      success: false,
      error: { code: 'WALLET_FETCH_FAILED', message: 'Failed to get wallet info' }
    });
  }
});

module.exports = router;