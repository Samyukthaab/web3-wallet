import React, { useState } from 'react';
import { ethers } from 'ethers';

const TransferForm = ({ currentBalance, onTransferInitiated, onCancel }) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ETH'); // 'ETH' or 'USD'
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate recipient address
    if (!recipientAddress.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!ethers.isAddress(recipientAddress.trim())) {
      newErrors.recipient = 'Invalid Ethereum address';
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      } else if (currency === 'ETH' && numAmount > currentBalance) {
        newErrors.amount = 'Insufficient balance';
      } else if (currency === 'USD' && numAmount < 1) {
        newErrors.amount = 'Minimum USD amount is $1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const transferData = {
        recipientAddress: recipientAddress.trim(),
        amount: parseFloat(amount),
        currency
      };

      await onTransferInitiated(transferData);
      
    } catch (error) {
      console.error('Transfer initiation failed:', error);
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const setMaxAmount = () => {
    if (currency === 'ETH') {
      setAmount(currentBalance.toString());
    }
  };

  const formatBalance = (balance) => {
    return parseFloat(balance).toFixed(4);
  };

  return (
    <div className="transfer-form">
      <div className="card">
        <div className="transfer-header">
          <h2 className="text-xl mb-2">💸 Send ETH</h2>
          <button 
            onClick={onCancel}
            className="close-btn"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Currency Toggle */}
          <div className="currency-selector">
            <label className="block text-sm mb-2 font-medium">
              Send Amount In
            </label>
            <div className="currency-toggle">
              <button
                type="button"
                onClick={() => setCurrency('ETH')}
                className={`currency-btn ${currency === 'ETH' ? 'active' : ''}`}
              >
                ETH
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
              >
                USD
              </button>
            </div>
          </div>

          {/* Recipient Address */}
          <div className="form-group">
            <label className="block text-sm mb-2 font-medium">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className={`input font-mono ${errors.recipient ? 'error' : ''}`}
            />
            {errors.recipient && (
              <span className="error-text">{errors.recipient}</span>
            )}
          </div>

          {/* Amount */}
          <div className="form-group">
            <div className="amount-header">
              <label className="block text-sm mb-2 font-medium">
                Amount ({currency})
              </label>
              {currency === 'ETH' && (
                <button
                  type="button"
                  onClick={setMaxAmount}
                  className="max-btn"
                >
                  MAX
                </button>
              )}
            </div>
            <div className="amount-input-container">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder={currency === 'ETH' ? '0.0000' : '0.00'}
                className={`input ${errors.amount ? 'error' : ''}`}
              />
              <span className="currency-symbol">{currency}</span>
            </div>
            {errors.amount && (
              <span className="error-text">{errors.amount}</span>
            )}
            {currency === 'ETH' && (
              <div className="balance-info">
                Available: {formatBalance(currentBalance)} ETH
              </div>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

          {/* Transaction Preview */}
          {recipientAddress && amount && !errors.recipient && !errors.amount && (
            <div className="transaction-preview">
              <h4 className="text-sm font-medium mb-2">Transaction Preview</h4>
              <div className="preview-details">
                <div className="preview-row">
                  <span>To:</span>
                  <span className="font-mono">{recipientAddress.slice(0, 10)}...{recipientAddress.slice(-8)}</span>
                </div>
                <div className="preview-row">
                  <span>Amount:</span>
                  <span>{amount} {currency}</span>
                </div>
                {currency === 'USD' && (
                  <div className="preview-note">
                    <small>💡 Amount will be converted to ETH at current market rate</small>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !recipientAddress || !amount}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;