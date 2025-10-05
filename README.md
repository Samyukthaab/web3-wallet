# CypherD Web3 Wallet MVP

A fully functional mock Web3 wallet application built for the CypherD Hackathon. This application demonstrates core Web3 wallet functionality including wallet creation, balance management, ETH transfers with real-time USD conversion, transaction history, and email notifications.

## 🚀 Live Demo

The application provides a complete Web3 wallet experience with professional cybersecurity-themed UI and robust backend infrastructure.

## ✨ Features

### Core Wallet Functionality
- 🔐 **Wallet Creation**: Generate new 12-word mnemonic phrases or import existing ones
- 💰 **Balance Management**: View mock ETH balances with real-time updates
- 🔄 **Wallet Import/Export**: Secure local storage with basic encryption
- 🚪 **Session Management**: Persistent wallet sessions with logout functionality

### Transaction System
- 💸 **ETH Transfers**: Send mock ETH to any Ethereum address
- 💱 **USD Conversion**: Real-time ETH/USD conversion using Skip API
- ✍️ **Digital Signatures**: Secure transaction signing with ethers.js
- ⏱️ **Time-Limited Approvals**: 30-second transaction approval windows
- 🛡️ **Price Protection**: Automatic rejection if price changes >1% during USD transfers

### User Experience
- 📊 **Transaction History**: Complete transaction tracking with detailed views
- 📧 **Email Notifications**: Automated transaction confirmations via email
- 🎨 **Professional UI**: Clean cybersecurity-themed interface
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Real-time Updates**: Live balance and transaction status updates

## 🛠 Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **Vite** for fast development and building
- **Ethers.js 6** for wallet operations and cryptographic functions
- **Axios** for API communication
- **CSS Modules** with professional cybersecurity theme

### Backend
- **Node.js** with Express framework
- **SQLite3** for lightweight, embedded database
- **Ethers.js** for signature verification
- **Nodemailer** for email notifications
- **Skip API** integration for real-time ETH/USD conversion

### Security Features
- Digital signature verification for all transactions
- Message validation and format checking
- Price change protection for USD conversions
- Atomic database transactions
- Input validation and sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- Gmail account (optional, for email notifications)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd web3-wallet-mvp
```

2. **Install dependencies:**
```bash
npm run install:all
```

3. **Configure email (optional):**
```bash
cd backend
cp .env.example .env
# Edit .env with your Gmail credentials
```

4. **Start the application:**
```bash
npm run dev
```

This starts both servers:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📖 Usage Guide

### 1. Wallet Setup
- **New Wallet**: Click "Create New" to generate a secure 12-word mnemonic
- **Import Wallet**: Click "Import Existing" and enter your mnemonic phrase
- **Email Setup**: Optionally add your email for transaction notifications

### 2. Dashboard
- View your current ETH balance
- Copy your wallet address
- Access quick actions (Send ETH, View History)

### 3. Sending ETH
- Click "Send ETH" from the dashboard
- Choose between ETH or USD amount input
- Enter recipient address and amount
- Review transaction details
- Sign and approve the transaction

### 4. Transaction History
- View all past transactions
- See sent/received status with visual indicators
- Check transaction details and timestamps
- Refresh for latest updates

### 5. Email Notifications
- Receive automatic confirmations for completed transactions
- Professional HTML email templates
- Fallback to console logging if email not configured

## 🏗 Project Structure

```
web3-wallet-mvp/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── WalletCreation.jsx
│   │   │   ├── BalanceDisplay.jsx
│   │   │   ├── TransferForm.jsx
│   │   │   ├── TransactionApproval.jsx
│   │   │   ├── TransactionHistory.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── utils/           # Utility functions
│   │   │   ├── wallet.js    # Wallet operations
│   │   │   └── api.js       # API client
│   │   ├── App.jsx          # Main application
│   │   └── index.css        # Styles
│   └── package.json
├── backend/                  # Node.js API server
│   ├── routes/              # API routes
│   │   ├── wallet.js        # Wallet endpoints
│   │   └── transaction.js   # Transaction endpoints
│   ├── services/            # Business logic
│   │   ├── skipApi.js       # Skip API integration
│   │   ├── signatureVerification.js
│   │   └── emailService.js  # Email notifications
│   ├── database.js          # SQLite setup
│   ├── server.js            # Express server
│   └── package.json
└── package.json             # Root scripts
```

## 🔧 API Endpoints

### Wallet Management
- `POST /api/wallet/create` - Create new wallet
- `GET /api/wallet/:address/balance` - Get wallet balance
- `PUT /api/wallet/:address/email` - Update email

### Transactions
- `POST /api/transaction/quote` - Get USD/ETH conversion quote
- `POST /api/transaction/execute` - Execute signed transaction
- `GET /api/transaction/history/:address` - Get transaction history

### System
- `GET /api/health` - Health check

## 🔐 Security Implementation

### Transaction Security
- **Digital Signatures**: All transactions require valid signatures
- **Message Validation**: Strict message format verification
- **Price Protection**: USD conversions protected against price volatility
- **Time Limits**: Transaction approvals expire after 30 seconds

### Data Security
- **Local Encryption**: Mnemonic phrases encrypted in browser storage
- **Input Validation**: All user inputs validated and sanitized
- **Error Handling**: Comprehensive error boundaries and fallbacks

## 🎯 Hackathon Requirements Fulfilled

✅ **Wallet Creation**: Generate/import 12-word mnemonic phrases  
✅ **Balance Display**: Show mock ETH balances clearly  
✅ **ETH Transfers**: Send mock ETH with recipient address and amount  
✅ **Transaction Approval**: Secure message signing for confirmations  
✅ **Transaction History**: Complete activity tracking  
✅ **Backend Integration**: Full API with database persistence  
✅ **Price Conversion**: Real-time ETH/USD conversion via Skip API  
✅ **Signature Verification**: Cryptographic transaction validation  
✅ **Balance Updates**: Atomic database operations  
✅ **Email Notifications**: Automated transaction confirmations  

## ⏱ Development Timeline

**Total Time**: 5 hours (9 AM - 2 PM IST, October 4, 2025)

- **9:00-9:30 AM**: Project setup, GitHub integration, architecture planning
- **9:30-11:00 AM**: Core wallet functionality (creation, import, balance)
- **11:00-12:30 PM**: Transfer system with Skip API integration
- **12:30-1:45 PM**: Transaction history, email notifications, final integration
- **1:45-2:00 PM**: Testing, documentation, final commit

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
cd frontend && npm run build
```

## 🤝 Contributing

This project was built for the CypherD Hackathon. The codebase demonstrates modern Web3 development practices with clean architecture and professional implementation.

## 📄 License

MIT License - Built for CypherD Hackathon 2025

---

**Built with ❤️ for the CypherD Hackathon**  
*Demonstrating the future of Web3 wallet technology*