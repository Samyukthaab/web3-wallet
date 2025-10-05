import React, { useState, useEffect } from 'react';
import { signMessage } from '../utils/wallet';
import { transactionAPI } from '../utils/api';

const TransactionApproval = ({ 
  transferData, 
  walletMnemonic, 
  onApproved, 
  onCancel 
}) => {
  const [quote, setQuote] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    getQuoteAndGenerateMessage();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setError('Transaction approval has expired. Please try again.');
    }
  }, [timeLeft]);

  const getQuoteAndGenerateMessage = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get price quote
      const quoteResponse = await transactionAPI.getQuote(
        transferData.amount, 
        transferData.currency
      );

      if (!quoteResponse.success) {
        throw new Error(quoteResponse.error?.message || 'Failed to get quote');
      }

      setQuote(quoteResponse);

      // Generate approval message
      let message;
      if (transferData.currency === 'ETH') {
        message = `Transfer ${transferData.amount} ETH to ${transferData.recipientAddress}`;
      } else {
        message = `Transfer ${quoteResponse.ethAmount.toFixed(6)} ETH ($${transferData.amount} USD) to ${transferData.recipientAddress}`;
      }

      setApprovalMessage(message);

    } catch (error) {
      console.error('Failed to get quote:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!approvalMessage) {
        throw new Error('No approval message generated');
      }

      // Sign the approval message
      const signature = await signMessage(approvalMessage, walletMnemonic);

      // Prepare transaction data
      const transactionData = {
        from: transferData.senderAddress,
        to: transferData.recipientAddress,
        amount: transferData.amount,
        currency: transferData.currency,
        signature,
        message: approvalMessage,
        quoteId: quote?.quoteId || null
      };

      // Execute transaction
      const response = await transactionAPI.executeTransaction(transactionData);

      if (!response.success) {
        throw new Error(response.error?.message || 'Transaction failed');
      }

      // Notify parent component
      onApproved(response);

    } catch (error) {
      console.error('Transaction approval failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading && !quote) {
    return (
      <div className="transaction-approval">
        <div className="card text-center">
          <h2 className="text-xl mb-4">🔄 Preparing Transaction</h2>
          <p>Getting price quote...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-approval">
      <div className="card">
        <div className="approval-header">
          <h2 className="text-xl mb-2">🔐 Approve Transaction</h2>
          <div className="timer">
            <span className={`timer-text ${timeLeft <= 10 ? 'warning' : ''}`}>
              ⏱️ {timeLeft}s
            </span>
          </div>
        </div>

        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}

        {quote && (
          <div className="transaction-details">
            <h3 className="text-lg mb-4">Transaction Details</h3>
            
            <div className="detail-grid">
              <div className="detail-row">
                <span className="detail-label">From:</span>
                <span className="detail-value font-mono">
                  {formatAddress(transferData.senderAddress)}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">To:</span>
                <span className="detail-value font-mono">
                  {formatAddress(transferData.recipientAddress)}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">
                  {transferData.currency === 'ETH' ? (
                    `${transferData.amount} ETH`
                  ) : (
                    `$${transferData.amount} USD`
                  )}
                </span>
              </div>
              
              {transferData.currency === 'USD' && (
                <div className="detail-row">
                  <span className="detail-label">ETH Equivalent:</span>
                  <span className="detail-value">
                    {quote.ethAmount.toFixed(6)} ETH
                  </span>
                </div>
              )}
              
              {quote.fallback && (
                <div className="detail-row warning">
                  <span className="detail-label">⚠️ Note:</span>
                  <span className="detail-value">
                    Using fallback exchange rate
                  </span>
                </div>
              )}
            </div>

            <div className="approval-message">
              <h4 className="text-sm font-medium mb-2">Message to Sign:</h4>
              <div className="message-box">
                <code>{approvalMessage}</code>
              </div>
            </div>

            <div className="security-notice">
              <p className="text-sm text-secondary">
                🔒 By approving, you authorize this transaction to be executed from your wallet.
                This action cannot be undone.
              </p>
            </div>

            <div className="approval-actions">
              <button
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading || timeLeft <= 0}
              >
                {isLoading ? 'Signing...' : '✅ Approve & Sign'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionApproval;