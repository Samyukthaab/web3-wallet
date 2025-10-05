import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../utils/api';
import { formatAddress } from '../utils/wallet';

const TransactionHistory = ({ walletAddress, onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactionHistory();
  }, [walletAddress]);

  const fetchTransactionHistory = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await transactionAPI.getHistory(walletAddress);
      
      if (response.success) {
        setTransactions(response.transactions);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch history');
      }
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTransactionType = (transaction) => {
    return transaction.from_address.toLowerCase() === walletAddress.toLowerCase() 
      ? 'sent' 
      : 'received';
  };

  const getCounterpartyAddress = (transaction) => {
    return transaction.from_address.toLowerCase() === walletAddress.toLowerCase()
      ? transaction.to_address
      : transaction.from_address;
  };

  if (isLoading) {
    return (
      <div className="transaction-history">
        <div className="card">
          <div className="history-header">
            <h2 className="text-xl">📊 Transaction History</h2>
            <button onClick={onBack} className="btn btn-secondary btn-sm">
              ← Back
            </button>
          </div>
          <div className="text-center">
            <p>Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="card">
        <div className="history-header">
          <h2 className="text-xl">📊 Transaction History</h2>
          <button onClick={onBack} className="btn btn-secondary btn-sm">
            ← Back
          </button>
        </div>

        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}

        <div className="history-controls">
          <button 
            onClick={fetchTransactionHistory}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="text-lg mb-2">No Transactions Yet</h3>
            <p className="text-secondary">
              Your transaction history will appear here once you start sending or receiving ETH.
            </p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map((transaction) => {
              const type = getTransactionType(transaction);
              const counterparty = getCounterpartyAddress(transaction);
              
              return (
                <div key={transaction.id} className={`transaction-item ${type}`}>
                  <div className="transaction-icon">
                    {type === 'sent' ? '📤' : '📥'}
                  </div>
                  
                  <div className="transaction-details">
                    <div className="transaction-main">
                      <div className="transaction-type">
                        <span className={`type-badge ${type}`}>
                          {type === 'sent' ? 'Sent' : 'Received'}
                        </span>
                        <span className="transaction-amount">
                          {parseFloat(transaction.eth_amount).toFixed(4)} ETH
                        </span>
                      </div>
                      
                      <div className="transaction-counterparty">
                        <span className="counterparty-label">
                          {type === 'sent' ? 'To:' : 'From:'}
                        </span>
                        <span className="counterparty-address font-mono">
                          {formatAddress(counterparty)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="transaction-meta">
                      <div className="transaction-date">
                        {formatDate(transaction.created_at)}
                      </div>
                      
                      {transaction.usd_amount && (
                        <div className="transaction-usd">
                          ${parseFloat(transaction.usd_amount).toFixed(2)} USD
                        </div>
                      )}
                      
                      <div className={`transaction-status ${transaction.status}`}>
                        {transaction.status === 'completed' ? '✅' : '⏳'}
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="history-footer">
            <p className="text-sm text-secondary text-center">
              Showing {transactions.length} recent transactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;