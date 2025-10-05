const { ethers } = require('ethers');

const verifySignature = async (message, signature, expectedAddress) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
      return {
        valid: false,
        error: 'Signature does not match sender address'
      };
    }

    return {
      valid: true,
      recoveredAddress
    };

  } catch (error) {
    return {
      valid: false,
      error: 'Invalid signature format'
    };
  }
};

const validateTransactionMessage = (message, transactionData) => {
  const { amount, currency, recipientAddress } = transactionData;
  
  let expectedMessage;
  if (currency === 'ETH') {
    expectedMessage = `Transfer ${amount} ETH to ${recipientAddress}`;
  } else {
    const ethAmount = parseFloat(transactionData.ethAmount).toFixed(6);
    expectedMessage = `Transfer ${ethAmount} ETH ($${amount} USD) to ${recipientAddress}`;
  }

  return message === expectedMessage;
};

module.exports = {
  verifySignature,
  validateTransactionMessage
};