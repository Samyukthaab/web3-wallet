import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Wallet API calls
export const walletAPI = {
  // Create wallet in backend
  createWallet: async (address, email = null) => {
    const response = await api.post('/wallet/create', { address, email });
    return response.data;
  },

  // Get wallet balance
  getBalance: async (address) => {
    const response = await api.get(`/wallet/${address}/balance`);
    return response.data;
  },

  // Update wallet email
  updateEmail: async (address, email) => {
    const response = await api.put(`/wallet/${address}/email`, { email });
    return response.data;
  }
};

// Transaction API calls
export const transactionAPI = {
  // Get price quote for USD conversion
  getQuote: async (amount, currency) => {
    const response = await api.post('/transaction/quote', { amount, currency });
    return response.data;
  },

  // Execute transaction
  executeTransaction: async (transactionData) => {
    const response = await api.post('/transaction/execute', transactionData);
    return response.data;
  },

  // Get transaction history
  getHistory: async (address) => {
    const response = await api.get(`/transaction/history/${address}`);
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;