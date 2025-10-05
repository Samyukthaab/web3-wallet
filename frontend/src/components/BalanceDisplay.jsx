import React, { useState, useEffect } from 'react';
import { formatAddress, copyToClipboard } from '../utils/wallet';
import { walletAPI } from '../utils/api';

const BalanceDisplay = ({ address, balance, isLoading, onRefresh }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await copyToClipboard(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return '0.0000';
    return parseFloat(balance).toFixed(4);
  };

  return (
    <div className="balance-display">
      <div className="card">
        <div className="balance-header">
          <h2 className="text-xl mb-2">💰 Wallet Balance</h2>
          <button 
            onClick={onRefresh}
            className="refresh-btn"
            disabled={isLoading}
            title="Refresh Balance"
          >
            🔄
          </button>
        </div>

        <div className="balance-main">
          <div className="balance-amount">
            <span className="balance-value">
              {isLoading ? (
                <span className="loading-text">Loading...</span>
              ) : (
                <>
                  <span className="eth-amount">{formatBalance(balance)}</span>
                  <span className="eth-symbol">ETH</span>
                </>
              )}
            </span>
          </div>

          <div className="wallet-address">
            <label className="address-label">Wallet Address</label>
            <div className="address-container">
              <span className="address-full font-mono">{address}</span>
              <span className="address-short font-mono">{formatAddress(address)}</span>
              <button 
                onClick={handleCopyAddress}
                className="copy-btn"
                title="Copy Address"
              >
                {copySuccess ? '✅' : '📋'}
              </button>
            </div>
            {copySuccess && (
              <span className="copy-success">Address copied!</span>
            )}
          </div>
        </div>

        <div className="balance-actions">
          <div className="balance-status">
            {balance > 0 ? (
              <span className="status-ready">🟢 Ready to send</span>
            ) : (
              <span className="status-empty">🔴 No funds available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceDisplay;