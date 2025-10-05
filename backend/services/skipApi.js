const axios = require('axios');

const SKIP_API_BASE_URL = 'https://api.skip.build/v2';

// Convert USD to ETH using Skip API
const convertUsdToEth = async (usdAmount) => {
  try {
    // Convert USD amount to USDC format (6 decimals)
    const usdcAmount = Math.floor(usdAmount * 1000000).toString();
    
    const requestBody = {
      source_asset_denom: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      source_asset_chain_id: "1", // Ethereum mainnet
      dest_asset_denom: "ethereum-native", // ETH
      dest_asset_chain_id: "1",
      amount_in: usdcAmount,
      chain_ids_to_addresses: {
        "1": "0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4"
      },
      slippage_tolerance_percent: "1",
      smart_swap_options: {
        evm_swaps: true
      },
      allow_unsafe: false
    };

    console.log('🔄 Skip API Request:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      `${SKIP_API_BASE_URL}/fungible/msgs_direct`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (!response.data || !response.data.amount_out) {
      throw new Error('Invalid response from Skip API');
    }

    // Convert ETH amount from wei (18 decimals) to ETH
    const ethAmountWei = response.data.amount_out;
    const ethAmount = parseFloat(ethAmountWei) / Math.pow(10, 18);

    console.log(`✅ Skip API: $${usdAmount} USD = ${ethAmount.toFixed(6)} ETH`);

    return {
      usdAmount,
      ethAmount,
      ethAmountWei,
      rate: ethAmount / usdAmount,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('❌ Skip API Error:', error.response?.data || error.message);
    
    // Fallback to mock conversion if Skip API fails
    console.log('🔄 Using fallback conversion rate');
    const mockRate = 0.0004; // Mock: 1 USD = 0.0004 ETH (ETH = $2500)
    const ethAmount = usdAmount * mockRate;
    
    return {
      usdAmount,
      ethAmount,
      ethAmountWei: Math.floor(ethAmount * Math.pow(10, 18)).toString(),
      rate: mockRate,
      timestamp: Date.now(),
      fallback: true
    };
  }
};

// Check if price has changed significantly (>1%)
const isPriceChangeSignificant = (oldRate, newRate, threshold = 0.01) => {
  const change = Math.abs(newRate - oldRate) / oldRate;
  return change > threshold;
};

// Format amounts for display
const formatEthAmount = (ethAmount) => {
  return parseFloat(ethAmount).toFixed(6);
};

const formatUsdAmount = (usdAmount) => {
  return parseFloat(usdAmount).toFixed(2);
};

module.exports = {
  convertUsdToEth,
  isPriceChangeSignificant,
  formatEthAmount,
  formatUsdAmount
};