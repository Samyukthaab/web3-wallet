import { ethers } from 'ethers';

// Simple encryption for demo purposes (NOT for production)
const ENCRYPTION_KEY = 'demo-key-not-secure';

export const encryptMnemonic = (mnemonic) => {
  // Simple XOR encryption for demo
  return btoa(mnemonic.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
  ).join(''));
};

export const decryptMnemonic = (encrypted) => {
  try {
    const decoded = atob(encrypted);
    return decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join('');
  } catch (error) {
    throw new Error('Invalid encrypted mnemonic');
  }
};

export const generateWallet = () => {
  try {
    // Generate random wallet
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      mnemonic: wallet.mnemonic.phrase,
      privateKey: wallet.privateKey
    };
  } catch (error) {
    throw new Error('Failed to generate wallet: ' + error.message);
  }
};

export const importWallet = (mnemonic) => {
  try {
    // Validate and import wallet from mnemonic
    const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
    
    return {
      address: wallet.address,
      mnemonic: wallet.mnemonic.phrase,
      privateKey: wallet.privateKey
    };
  } catch (error) {
    throw new Error('Invalid mnemonic phrase');
  }
};

export const validateMnemonic = (mnemonic) => {
  try {
    ethers.Wallet.fromPhrase(mnemonic.trim());
    return true;
  } catch (error) {
    return false;
  }
};

export const saveWalletToStorage = (walletData) => {
  try {
    const encryptedMnemonic = encryptMnemonic(walletData.mnemonic);
    const storageData = {
      address: walletData.address,
      encryptedMnemonic,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('cypherWallet', JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error('Failed to save wallet:', error);
    return false;
  }
};

export const loadWalletFromStorage = () => {
  try {
    const stored = localStorage.getItem('cypherWallet');
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    const mnemonic = decryptMnemonic(data.encryptedMnemonic);
    
    return {
      address: data.address,
      mnemonic,
      createdAt: data.createdAt
    };
  } catch (error) {
    console.error('Failed to load wallet:', error);
    return null;
  }
};

export const clearWalletFromStorage = () => {
  localStorage.removeItem('cypherWallet');
};

export const signMessage = async (message, mnemonic) => {
  try {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    const signature = await wallet.signMessage(message);
    return signature;
  } catch (error) {
    throw new Error('Failed to sign message: ' + error.message);
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};