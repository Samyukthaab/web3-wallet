const nodemailer = require('nodemailer');

let transporter = null;

const initializeEmailService = () => {
  console.log('📧 Email service configured for demo purposes');
  console.log('📧 All notifications will be displayed in console with full email content');
  return true;
};

const sendTransactionNotification = async (recipientEmail, transactionData) => {
  const { transactionId, from, to, ethAmount, usdAmount, currency } = transactionData;

  const subject = 'CypherD Wallet - Transaction Confirmation';

  let amountText = `${parseFloat(ethAmount).toFixed(4)} ETH`;
  if (currency === 'USD' && usdAmount) {
    amountText += ` ($${parseFloat(usdAmount).toFixed(2)} USD)`;
  }

  console.log('📧 EMAIL NOTIFICATION TRIGGERED:');
  console.log(`   To: ${recipientEmail}`);
  console.log(`   Amount: ${amountText}`);
  console.log(`   From: ${from.slice(0, 10)}...`);
  console.log(`   To: ${to.slice(0, 10)}...`);
  console.log(`   Transaction ID: ${transactionId}`);

  const textContent = `
CypherD Wallet - Transaction Confirmation

Transaction Successful!

Amount: ${amountText}
From: ${from}
To: ${to}
Transaction ID: ${transactionId}

This transaction has been securely processed and recorded on your CypherD Wallet.

This is an automated message from CypherD Wallet MVP.
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e293b, #334155); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🔐 CypherD Wallet</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.8;">Transaction Confirmation</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">✅ Transaction Successful</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 15px 0; color: #374151;"><strong>Amount:</strong> ${amountText}</p>
          <p style="margin: 0 0 15px 0; color: #374151;"><strong>From:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${from}</code></p>
          <p style="margin: 0 0 15px 0; color: #374151;"><strong>To:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${to}</code></p>
          <p style="margin: 0; color: #374151;"><strong>Transaction ID:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${transactionId}</code></p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            🔒 This transaction has been securely processed and recorded on your CypherD Wallet.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
        <p>This is an automated message from CypherD Wallet MVP</p>
      </div>
    </div>
  `;

  // Display full email content in console for demo
  console.log('');
  console.log('📧 ═══════════════ EMAIL NOTIFICATION ═══════════════');
  console.log(`📧 TO: ${recipientEmail}`);
  console.log(`📧 FROM: CypherD Wallet <noreply@cypherwalletmvp.com>`);
  console.log(`📧 SUBJECT: ${subject}`);
  console.log('📧 ─────────────────────────────────────────────────────');
  console.log('📧 EMAIL CONTENT:');
  console.log(textContent);
  console.log('📧 ═══════════════════════════════════════════════════');
  console.log('');

  // For hackathon demo purposes, we simulate successful email sending
  console.log(`✅ Email notification sent successfully to ${recipientEmail}`);
  console.log('📧 Note: In production, this would be sent via Gmail/SendGrid/etc.');

  return {
    success: true,
    messageId: 'demo-' + Date.now(),
    method: 'demo',
    recipient: recipientEmail,
    subject: subject
  };
};

const sendTestEmail = async (testEmail = 'saravanaguhan123@gmail.com') => {
  console.log(`📧 Sending test email to: ${testEmail}`);

  const testData = {
    transactionId: 'test-' + Date.now(),
    from: '0x1234567890123456789012345678901234567890',
    to: '0x0987654321098765432109876543210987654321',
    ethAmount: 0.5,
    usdAmount: 1250,
    currency: 'USD'
  };

  return await sendTransactionNotification(testEmail, testData);
};

module.exports = {
  initializeEmailService,
  sendTransactionNotification,
  sendTestEmail
};