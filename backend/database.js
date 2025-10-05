const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './wallet.db';

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('📊 Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  // Create wallets table
  db.run(`
    CREATE TABLE IF NOT EXISTS wallets (
      address TEXT PRIMARY KEY,
      balance REAL NOT NULL DEFAULT 0,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating wallets table:', err.message);
    } else {
      console.log('✅ Wallets table ready');
    }
  });

  // Create transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      eth_amount REAL NOT NULL,
      usd_amount REAL,
      status TEXT NOT NULL DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_address) REFERENCES wallets(address),
      FOREIGN KEY (to_address) REFERENCES wallets(address)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating transactions table:', err.message);
    } else {
      console.log('✅ Transactions table ready');
    }
  });

  // Create price quotes table for caching
  db.run(`
    CREATE TABLE IF NOT EXISTS price_quotes (
      id TEXT PRIMARY KEY,
      eth_amount REAL NOT NULL,
      usd_amount REAL NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating price_quotes table:', err.message);
    } else {
      console.log('✅ Price quotes table ready');
    }
  });
}

module.exports = db;