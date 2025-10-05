import React, { useState } from 'react';
import { generateWallet, importWallet, validateMnemonic, saveWalletToStorage } from '../utils/wallet';
import { walletAPI } from '../utils/api';

const WalletCreation = ({ onWalletCreated }) => {
  const [mode, setMode] = useState('create'); // 'create' or 'import'
  const [mnemonic, setMnemonic] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedWallet, setGeneratedWallet] = useState(null);

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Generate new wallet
      const wallet = generateWallet();
      setGeneratedWallet(wallet);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWallet = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!mnemonic.trim()) {
        throw new Error('Please enter a mnemonic phrase');
      }

      if (!validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }

      // Import wallet
      const wallet = importWallet(mnemonic);
      await finalizeWallet(wallet);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmWallet = async () => {
    if (!generatedWallet) return;
    
    try {
      setIsLoading(true);
      await finalizeWallet(generatedWallet);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeWallet = async (wallet) => {
    try {
      // Save to local storage
      const saved = saveWalletToStorage(wallet);
      if (!saved) {
        throw new Error('Failed to save wallet locally');
      }

      // Create wallet in backend
      await walletAPI.createWallet(wallet.address, email || null);

      // Notify parent component
      onWalletCreated({
        address: wallet.address,
        mnemonic: wallet.mnemonic
      });

    } catch (error) {
      throw new Error('Failed to create wallet: ' + error.message);
    }
  };

  const copyMnemonic = () => {
    if (generatedWallet) {
      navigator.clipboard.writeText(generatedWallet.mnemonic);
    }
  };

  if (generatedWallet) {
    return (
      <div className="wallet-creation">
        <div className="card">
          <h2 className="text-xl mb-4 text-center">🔐 Secure Your Wallet</h2>
          
          <div className="mb-6">
            <p className="text-sm text-secondary mb-4">
              Save this 12-word recovery phrase in a secure location. You'll need it to restore your wallet.
            </p>
            
            <div className="mnemonic-display">
              <div className="mnemonic-words">
                {generatedWallet.mnemonic.split(' ').map((word, index) => (
                  <span key={index} className="mnemonic-word">
                    <span className="word-number">{index + 1}</span>
                    {word}
                  </span>
                ))}
              </div>
              <button 
                onClick={copyMnemonic}
                className="btn btn-secondary mt-4"
                type="button"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">
              Email (optional - for notifications)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input"
            />
          </div>

          {error && (
            <div className="error-message mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2">
            <button 
              onClick={() => setGeneratedWallet(null)}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Back
            </button>
            <button 
              onClick={handleConfirmWallet}
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Confirm & Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-creation">
      <div className="card">
        <h2 className="text-xl mb-6 text-center">🔐 CypherD Wallet Setup</h2>
        
        <div className="mode-selector mb-6">
          <div className="grid grid-cols-2">
            <button
              onClick={() => setMode('create')}
              className={`btn ${mode === 'create' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Create New
            </button>
            <button
              onClick={() => setMode('import')}
              className={`btn ${mode === 'import' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Import Existing
            </button>
          </div>
        </div>

        {mode === 'create' ? (
          <div className="create-mode">
            <p className="text-center text-secondary mb-6">
              Generate a new secure wallet with a 12-word recovery phrase
            </p>
            
            <div className="mb-4">
              <label className="block text-sm mb-2">
                Email (optional - for notifications)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input"
              />
            </div>

            {error && (
              <div className="error-message mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateWallet}
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : '🔑 Generate New Wallet'}
            </button>
          </div>
        ) : (
          <div className="import-mode">
            <p className="text-center text-secondary mb-4">
              Enter your 12-word recovery phrase to restore your wallet
            </p>
            
            <div className="mb-4">
              <label className="block text-sm mb-2">
                Recovery Phrase
              </label>
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Enter your 12-word recovery phrase..."
                className="input"
                rows="3"
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2">
                Email (optional - for notifications)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input"
              />
            </div>

            {error && (
              <div className="error-message mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleImportWallet}
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !mnemonic.trim()}
            >
              {isLoading ? 'Importing...' : '📥 Import Wallet'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletCreation;