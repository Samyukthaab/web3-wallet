const express = require('express');
const router = express.Router();
const db = require('../database');
const { convertUsdToEth, isPriceChangeSignificant } = require('../services/skipApi');
const { verifySignature, validateTransactionMessage } = require('../services/signatureVerification');
const { sendTransactionNotification } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

// Get price quote for USD conversion
router.post('/quote', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Amount and currency are required' }
      });
    }

    if (currency === 'ETH') {
      // For ETH, no conversion needed
      return res.json({
        success: true,
        ethAmount: amount,
        usdAmount: null,
        expiresAt: Date.now() + 30000, // 30 seconds
        currency: 'ETH'
      });
    }

    if (currency === 'USD') {
      // Convert USD to ETH using Skip API
      const conversion = await convertUsdToEth(amount);
      
      // Cache the quote for 30 seconds
      const quoteId = uuidv4();
      const expiresAt = Date.now() + 30000;
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO price_quotes (id, eth_amount, usd_amount, expires_at) VALUES (?, ?, ?, ?)',
          [quoteId, conversion.ethAmount, conversion.usdAmount, new Date(expiresAt).toISOString()],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      return res.json({
        success: true,
        quoteId,
        ethAmount: conversion.ethAmount,
        usdAmount: conversion.usdAmount,
        expiresAt,
        currency: 'USD',
        rate: conversion.rate,
        fallback: conversion.fallback || false
      });
    }

    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_CURRENCY', message: 'Currency must be ETH or USD' }
    });

  } catch (error) {
    console.error('Error getting quote:', error);
    res.status(500).json({
      success: false,
      error: { code: 'QUOTE_FAILED', message: 'Failed to get price quote' }
    });
  }
});

// Execute transaction
router.post('/execute', async (req, res) => {
  try {
    const { from, to, amount, currency, signature, message, quoteId } = req.body;

    // Validate required fields
    if (!from || !to || !amount || !currency || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'All transaction fields are required' }
      });
    }

    // Get sender wallet
    const senderWallet = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM wallets WHERE address = ?', [from], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!senderWallet) {
      return res.status(404).json({
        success: false,
        error: { code: 'SENDER_NOT_FOUND', message: 'Sender wallet not found' }
      });
    }

    let ethAmount = amount;
    let usdAmount = null;

    // Handle USD conversion
    if (currency === 'USD') {
      if (!quoteId) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_QUOTE_ID', message: 'Quote ID required for USD transactions' }
        });
      }

      // Get cached quote
      const quote = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM price_quotes WHERE id = ?', [quoteId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!quote) {
        return res.status(400).json({
          success: false,
          error: { code: 'QUOTE_NOT_FOUND', message: 'Price quote not found' }
        });
      }

      // Check if quote has expired
      if (new Date(quote.expires_at) < new Date()) {
        return res.status(400).json({
          success: false,
          error: { code: 'QUOTE_EXPIRED', message: 'Price quote has expired' }
        });
      }

      // Get new price quote for verification
      const newConversion = await convertUsdToEth(amount);
      
      // Check for significant price change (>1%)
      const oldRate = quote.eth_amount / quote.usd_amount;
      if (isPriceChangeSignificant(oldRate, newConversion.rate)) {
        return res.status(400).json({
          success: false,
          error: { 
            code: 'PRICE_CHANGED', 
            message: 'Price has changed significantly. Please get a new quote.' 
          }
        });
      }

      ethAmount = quote.eth_amount;
      usdAmount = quote.usd_amount;
    }

    // Check sufficient balance
    if (senderWallet.balance < ethAmount) {
      return res.status(400).json({
        success: false,
        error: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient balance' }
      });
    }

    // Verify signature
    const signatureResult = await verifySignature(message, signature, from);
    if (!signatureResult.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: signatureResult.error }
      });
    }

    // Validate message format
    const messageValid = validateTransactionMessage(message, {
      amount,
      currency,
      recipientAddress: to,
      ethAmount
    });

    if (!messageValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_MESSAGE', message: 'Transaction message format is invalid' }
      });
    }

    // Get or create recipient wallet
    let recipientWallet = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM wallets WHERE address = ?', [to], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!recipientWallet) {
      // Create recipient wallet with 0 balance
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO wallets (address, balance) VALUES (?, 0)',
          [to],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
      recipientWallet = { address: to, balance: 0 };
    }

    // Execute transaction atomically
    const transactionId = uuidv4();
    
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Update sender balance
        db.run(
          'UPDATE wallets SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE address = ?',
          [ethAmount, from],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
          }
        );
        
        // Update recipient balance
        db.run(
          'UPDATE wallets SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE address = ?',
          [ethAmount, to],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
          }
        );
        
        // Record transaction
        db.run(
          'INSERT INTO transactions (id, from_address, to_address, amount, currency, eth_amount, usd_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [transactionId, from, to, amount, currency, ethAmount, usdAmount, 'completed'],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          }
        );
      });
    });

    console.log(`Transaction completed: ${ethAmount} ETH from ${from} to ${to}`);

    // Send email notification if sender has email
    console.log(`🔍 Checking email notification for wallet: ${from}`);
    console.log(`   Sender email: ${senderWallet.email || 'NOT SET'}`);
    
    if (senderWallet.email) {
      try {
        console.log(`📧 Sending email notification to: ${senderWallet.email}`);
        await sendTransactionNotification(senderWallet.email, {
          transactionId,
          from,
          to,
          ethAmount,
          usdAmount,
          currency
        });
      } catch (error) {
        console.error('❌ Email notification failed:', error.message);
      }
    } else {
      console.log('⚠️  No email address found for sender - skipping notification');
    }

    res.json({
      success: true,
      transactionId,
      ethAmount,
      usdAmount,
      message: 'Transaction completed successfully'
    });

  } catch (error) {
    console.error('Error executing transaction:', error);
    res.status(500).json({
      success: false,
      error: { code: 'TRANSACTION_FAILED', message: 'Failed to execute transaction' }
    });
  }
});

// Get transaction history
router.get('/history/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const transactions = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM transactions WHERE from_address = ? OR to_address = ? ORDER BY created_at DESC LIMIT 50',
        [address, address],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({
      success: false,
      error: { code: 'HISTORY_FETCH_FAILED', message: 'Failed to get transaction history' }
    });
  }
});

module.exports = router;