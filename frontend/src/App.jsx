import React, { useState, useEffect } from 'react';
import './App.css';
import WalletCreation from './components/WalletCreation';
import BalanceDisplay from './components/BalanceDisplay';
import TransferForm from './components/TransferForm';
import TransactionApproval from './components/TransactionApproval';
import TransactionHistory from './components/TransactionHistory';
import ErrorBoundary from './components/ErrorBoundary';
import { loadWalletFromStorage, clearWalletFromStorage } from './utils/wallet';
import { walletAPI } from './utils/api';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'transfer', 'approval', 'history'
  const [transferData, setTransferData] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);

      // Check if wallet exists in local storage
      const storedWallet = loadWalletFromStorage();
      if (storedWallet) {
        setWallet(storedWallet);
        await fetchBalance(storedWallet.address);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setError('Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async (address) => {
    try {
      setBalanceLoading(true);
      const response = await walletAPI.getBalance(address);
      setBalance(response.balance);
      setError('');
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setError('Failed to fetch balance');
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleWalletCreated = async (walletData) => {
    setWallet(walletData);
    await fetchBalance(walletData.address);
  };

  const handleLogout = () => {
    clearWalletFromStorage();
    setWallet(null);
    setBalance(0);
    setError('');
  };

  const handleRefreshBalance = () => {
    if (wallet) {
      fetchBalance(wallet.address);
    }
  };

  const handleTransferInitiated = async (data) => {
    setTransferData({
      ...data,
      senderAddress: wallet.address
    });
    setCurrentView('approval');
  };

  const handleTransactionApproved = async (result) => {
    console.log('Transaction approved:', result);
    setCurrentView('dashboard');
    setTransferData(null);
    // Refresh balance after transaction
    await fetchBalance(wallet.address);
  };

  const handleCancelTransfer = () => {
    setCurrentView('dashboard');
    setTransferData(null);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="container text-center">
          <h1 className="text-2xl mb-4">🔐 CypherD Wallet MVP</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <div className="header-content">
              <div>
                <h1 className="text-2xl">🔐 CypherD Wallet MVP</h1>
                <p className="text-sm text-secondary">Secure Mock Web3 Wallet</p>
              </div>
              {wallet && (
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                >
                  🚪 Logout
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            {error && (
              <div className="error-message mb-4">
                {error}
              </div>
            )}

            {!wallet ? (
              <WalletCreation onWalletCreated={handleWalletCreated} />
            ) : (
              <div className="wallet-dashboard">
                {currentView === 'dashboard' && (
                  <>
                    <BalanceDisplay
                      address={wallet.address}
                      balance={balance}
                      isLoading={balanceLoading}
                      onRefresh={handleRefreshBalance}
                    />

                    <div className="dashboard-actions">
                      <div className="card text-center">
                        <h3 className="text-lg mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2">
                          <button
                            className="btn btn-primary"
                            onClick={() => setCurrentView('transfer')}
                          >
                            💸 Send ETH
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentView('history')}
                          >
                            📊 Transaction History
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentView === 'transfer' && (
                  <TransferForm
                    currentBalance={balance}
                    onTransferInitiated={handleTransferInitiated}
                    onCancel={handleCancelTransfer}
                  />
                )}

                {currentView === 'approval' && transferData && (
                  <TransactionApproval
                    transferData={transferData}
                    walletMnemonic={wallet.mnemonic}
                    onApproved={handleTransactionApproved}
                    onCancel={handleCancelTransfer}
                  />
                )}

                {currentView === 'history' && (
                  <TransactionHistory
                    walletAddress={wallet.address}
                    onBack={() => setCurrentView('dashboard')}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;