# KindShare 4.0 - System Architecture & Requirements

## 📋 Project Overview

**Project Name**: KindShare 4.0  
**Type**: Web3 Sharing Economy Platform  
**Version**: 4.0.0  
**Network**: Sepolia Testnet  
**Date**: November 2025

### Vision
Transform a traditional Web2 e-commerce platform into a Web3-enabled sharing economy platform with a virtual community token system (KSTT - Kind Share Token).

### Core Innovation
Users can buy and sell items using blockchain-based tokens through MetaMask wallet integration, creating a decentralized marketplace where transactions are recorded immutably on the Ethereum blockchain.

---

## 🎯 Core Requirements

### 1. User Registration & Token Distribution
- ✅ New users register with email/password
- ✅ Users receive **100 KSTT tokens** upon wallet connection
- ✅ Tokens are minted on Sepolia testnet blockchain
- ✅ User wallet addresses stored in MongoDB
- ✅ Automatic token airdrop after MetaMask connection

### 2. MetaMask Wallet Integration
- ✅ Connect/disconnect wallet functionality
- ✅ Display wallet address and balance
- ✅ Automatic network switching to Sepolia
- ✅ Real-time balance updates
- ✅ Account change detection
- ✅ Chain change handling

### 3. Product Management
- ✅ Users can publish products
- ✅ View "My Products" list
- ✅ Products priced in KSTT tokens
- ✅ Track product seller's wallet address
- ✅ Product categories and filtering
- ✅ Image upload support

### 4. Token-Based Purchases
- ✅ Buy products using KSTT tokens
- ✅ Automatic token transfer from buyer to seller
- ✅ Transaction recorded on blockchain
- ✅ Order history with transaction hashes
- ✅ Real-time transaction status

### 5. Dual Payment System
- ✅ **Traditional**: Cash on Delivery (COD) or Card
- ✅ **Crypto**: KSTT token payments via blockchain
- ✅ Backward compatible with existing payment methods
- ✅ Seamless payment method switching

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React App  │  │   MetaMask   │  │  Redux Store │         │
│  │  (Frontend)  │──│   Provider   │──│   (State)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST API
                            │ Port 3002 → 4000
┌───────────────────────────▼─────────────────────────────────────┐
│                       APPLICATION LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Express    │  │     Auth     │  │    Web3      │         │
│  │   Server     │──│  Middleware  │──│  Controllers │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
┌─────────────▼──────────────┐  ┌────────▼─────────────────────┐
│      DATA LAYER            │  │    BLOCKCHAIN LAYER          │
│  ┌──────────────────────┐  │  │  ┌────────────────────────┐ │
│  │     MongoDB          │  │  │  │   Sepolia Network      │ │
│  │  - Users             │  │  │  │  - Smart Contract      │ │
│  │  - Products          │  │  │  │  - Token Balances      │ │
│  │  - Orders            │  │  │  │  - Transactions        │ │
│  └──────────────────────┘  │  │  └────────────────────────┘ │
│   Port: 27017              │  │   RPC: Infura/Alchemy       │
└────────────────────────────┘  └─────────────────────────────┘
```

### Technology Stack

#### Backend Stack
```yaml
Runtime: Node.js v18+
Framework: Express.js v4.18+
Database: MongoDB v6.0+
Web3 Library: Ethers.js v6.15+
Authentication: JWT (jsonwebtoken)
Password Hashing: bcryptjs
File Upload: Cloudinary (optional)
Email: Nodemailer (optional)
```

#### Frontend Stack
```yaml
Framework: React v18.2
State Management: Redux Toolkit v1.9
Routing: React Router v6.16
Web3 Integration: Ethers.js v6.15
Wallet: MetaMask Browser Extension
UI Notifications: React Hot Toast
HTTP Client: RTK Query
```

#### Smart Contract Stack
```yaml
Language: Solidity ^0.8.0
Standard: ERC20 (OpenZeppelin)
Development: Hardhat
Network: Sepolia Testnet
Verification: Etherscan API
```

---

## 📊 Data Models

### User Model
**File**: `backend/models/user.js`

```javascript
{
  _id: ObjectId,
  name: String (max 50 chars, required),
  email: String (unique, required),
  password: String (hashed, min 6 chars, required),
  role: Enum ["user", "admin"] (default: "user"),
  walletAddress: String (unique, sparse, lowercase, format: 0x...),
  tokenBalance: Number (cached, default: 100),
  avatar: {
    public_id: String,
    url: String
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- email (unique)
- walletAddress (unique, sparse)
```

### Product Model
**File**: `backend/models/product.js`

```javascript
{
  _id: ObjectId,
  name: String (max 200 chars, required),
  price: Number (in KSTT, max 5 digits, required),
  description: String (required),
  category: Enum [
    "Electronics", "Cameras", "Laptops", "Accessories",
    "Headphones", "Food", "Books", "Sports", "Outdoor", "Home"
  ],
  seller: String (seller name, required),
  stock: Number (required),
  ratings: Number (default: 0),
  numOfReviews: Number (default: 0),
  images: [{
    public_id: String (required),
    url: String (required)
  }],
  reviews: [{
    user: ObjectId (ref: User, required),
    rating: Number (required),
    comment: String (required)
  }],
  user: ObjectId (ref: User, product owner),
  sellerWallet: String (lowercase, format: 0x...),
  sellerUser: ObjectId (ref: User),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- user
- category
- createdAt (descending)
```

### Order Model
**File**: `backend/models/order.js`

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  orderItems: [{
    name: String (required),
    quantity: Number (required),
    image: String (required),
    price: String (required),
    product: ObjectId (ref: Product, required)
  }],
  shippingInfo: {
    address: String (required),
    city: String (required),
    phoneNo: String (required),
    zipCode: String (required),
    country: String (required)
  },
  paymentMethod: Enum ["COD", "Card"] (required),
  paymentInfo: {
    id: String,
    status: String
  },
  itemsPrice: Number (required),
  taxAmount: Number (required),
  shippingAmount: Number (required),
  totalAmount: Number (required),
  orderStatus: Enum ["Processing", "Shipped", "Delivered"] (default: "Processing"),
  deliveredAt: Date,
  
  // Web3 Fields
  paymentType: Enum ["traditional", "crypto"] (default: "traditional"),
  web3TransactionHash: String,
  tokenTransferred: Number (default: 0),
  buyerWallet: String (lowercase),
  sellerWallet: String (lowercase),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- user
- orderStatus
- createdAt (descending)
```

---

## 🔐 Smart Contract Architecture

### KindToken Contract
**File**: `backend/contracts/KindToken.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

Contract Details:
├─ Name: Kind Share Token
├─ Symbol: KSTT
├─ Decimals: 18
├─ Initial Supply: 10,000,000 KSTT
└─ Standard: ERC20

Functions:
├─ mint(address to, uint256 amount) - Admin only
│  └─ Mints new tokens to specified address
├─ burn(uint256 amount) - Public
│  └─ Burns tokens from caller's balance
├─ transfer(address to, uint256 amount) - Public
│  └─ Standard ERC20 transfer
├─ transferFrom(address from, address to, uint256 amount) - Public
│  └─ Delegated transfer (requires approval)
└─ balanceOf(address account) - View
   └─ Returns token balance of address

Access Control:
├─ Owner: Backend wallet (deploys contract)
├─ Minting: Only owner can mint
└─ Transfers: Anyone can transfer their tokens

Events:
├─ Transfer(from, to, amount)
├─ Approval(owner, spender, amount)
└─ OwnershipTransferred(previousOwner, newOwner)
```

**Deployment Configuration**:
- Network: Sepolia Testnet
- Chain ID: 11155111
- Block Explorer: https://sepolia.etherscan.io
- Gas Optimization: Enabled
- Verification: Etherscan API

---

## 🌐 API Architecture

### Base URL
```
Development: http://localhost:4000
Production: https://api.kindshare.com
API Version: v1
Base Path: /api/v1
```

### Authentication Endpoints

#### POST `/api/v1/register`
Register new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "walletAddress": null,
    "tokenBalance": 100
  }
}
```

#### POST `/api/v1/login`
User login

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "tokenBalance": 100
  }
}
```

#### GET `/api/v1/logout`
User logout

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Web3 Endpoints

#### POST `/api/v1/wallet/connect`
Connect MetaMask wallet and mint initial tokens

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Request Body**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "tokenBalance": 100
  },
  "transaction": {
    "hash": "0x123abc...",
    "blockNumber": 1234567
  }
}
```

#### GET `/api/v1/wallet/balance/:address`
Get token balance of wallet address

**Response** (200):
```json
{
  "success": true,
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "balance": "100.0"
}
```

#### POST `/api/v1/tokens/transfer`
Transfer tokens between users (admin or authorized user)

**Request Body**:
```json
{
  "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": 50
}
```

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0x123abc...",
  "blockNumber": 1234568,
  "from": "0x...",
  "to": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "amount": "50"
}
```

### Product Endpoints

#### GET `/api/v1/products`
Get all products with filters

**Query Parameters**:
```
?keyword=laptop
&category=Electronics
&price[gte]=10
&price[lte]=100
&ratings[gte]=4
&page=1
&resPerPage=10
```

**Response** (200):
```json
{
  "success": true,
  "products": [...],
  "resPerPage": 10,
  "filteredProductsCount": 45,
  "totalProductsCount": 100
}
```

#### POST `/api/v1/admin/product/new`
Create new product (authenticated)

**Request Body**:
```json
{
  "name": "Laptop",
  "price": 50,
  "description": "High-end laptop",
  "category": "Electronics",
  "stock": 10,
  "seller": "John's Store",
  "images": [
    {
      "public_id": "img123",
      "url": "https://..."
    }
  ]
}
```

**Response** (201):
```json
{
  "success": true,
  "product": {
    "_id": "product_id",
    "name": "Laptop",
    "price": 50,
    "sellerWallet": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "user": "user_id",
    ...
  }
}
```

#### GET `/api/v1/me/products`
Get current user's products (authenticated)

**Response** (200):
```json
{
  "success": true,
  "products": [...]
}
```

### Order Endpoints

#### POST `/api/v1/orders/new`
Create new order with optional crypto payment

**Request Body**:
```json
{
  "orderItems": [...],
  "shippingInfo": {...},
  "itemsPrice": 100,
  "taxAmount": 10,
  "shippingAmount": 5,
  "totalAmount": 115,
  "paymentMethod": "Card",
  "paymentType": "crypto",
  "buyerWallet": "0x...",
  "sellerWallet": "0x..."
}
```

**Response** (200):
```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "web3TransactionHash": "0x123abc...",
    "tokenTransferred": 115,
    "paymentType": "crypto",
    ...
  }
}
```

#### GET `/api/v1/me/orders`
Get current user's orders (authenticated)

**Response** (200):
```json
{
  "success": true,
  "orders": [...]
}
```

---

## 🔄 Core Workflows

### Workflow 1: User Registration → Token Airdrop

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Registration
┌──────────────┐    POST /api/v1/register    ┌──────────────┐
│   Frontend   │──────────────────────────────▶│   Backend    │
│  (Register)  │◀──────────────────────────────│              │
└──────────────┘    {token, user}             └──────┬───────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │    MongoDB      │
                                            │  Create User:   │
                                            │  - email        │
                                            │  - password     │
                                            │  - tokenBalance │
                                            │  - walletAddress│
                                            │    = null       │
                                            └─────────────────┘

Step 2: MetaMask Connection
┌──────────────┐    Request Account Access   ┌──────────────┐
│   Frontend   │──────────────────────────────▶│   MetaMask   │
│              │◀──────────────────────────────│              │
└──────┬───────┘    walletAddress             └──────────────┘
       │
       │ POST /api/v1/wallet/connect
       │ {walletAddress}
       │
       ▼
┌──────────────┐
│   Backend    │
│              │
│ 1. Validate  │
│    address   │
│              │
│ 2. Update DB:│
│    user.     │
│    wallet    │
│    Address   │
└──────┬───────┘
       │
       │ Call contract.mint()
       │
       ▼
┌─────────────────────────────────────────────┐
│          BLOCKCHAIN (Sepolia)               │
│                                             │
│  Smart Contract: KindToken                  │
│  Function: mint(userAddress, 100 * 10^18)  │
│                                             │
│  1. Verify caller is owner ✓               │
│  2. Mint 100 tokens to user address        │
│  3. Emit Transfer event                    │
│  4. Return transaction hash                │
│                                             │
│  Gas paid by: Backend wallet               │
│  Time: ~15-30 seconds                      │
└─────────────┬───────────────────────────────┘
              │
              │ Transaction Receipt
              │
              ▼
┌──────────────┐    Return success           ┌──────────────┐
│   Backend    │──────────────────────────────▶│   Frontend   │
│              │    {txHash, user}            │              │
└──────────────┘                              └──────────────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │   MetaMask      │
                                            │   Shows:        │
                                            │   100 KSTT      │
                                            └─────────────────┘

Total Time: ~30-45 seconds
Gas Cost: ~0.0002 ETH (Sepolia)
```

### Workflow 2: Product Purchase with Tokens

```
┌─────────────────────────────────────────────────────────────────┐
│                    PURCHASE FLOW                                │
└─────────────────────────────────────────────────────────────────┘

Step 1: Product Selection
┌──────────────┐    Browse Products           ┌──────────────┐
│    Buyer     │──────────────────────────────▶│   Frontend   │
│              │    Select Product             │              │
│              │    Add to Cart                │              │
└──────────────┘                              └──────────────┘

Step 2: Checkout
┌──────────────┐    View Cart                 ┌──────────────┐
│    Buyer     │──────────────────────────────▶│   Frontend   │
│              │    Proceed to Checkout        │              │
│              │    Select "Pay with KSTT"     │              │
└──────┬───────┘                              └──────────────┘
       │
       │ Confirm Purchase
       │
       ▼
┌──────────────┐    POST /api/v1/orders/new  ┌──────────────┐
│   Frontend   │──────────────────────────────▶│   Backend    │
│              │    Body:                      │              │
│              │    - orderItems               │  1. Validate │
│              │    - totalAmount: 50          │     order    │
│              │    - buyerWallet              │              │
│              │    - sellerWallet             │  2. Check    │
│              │    - paymentType: "crypto"    │     balance  │
└──────────────┘                              └──────┬───────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │    MongoDB      │
                                            │  Get Product:   │
                                            │  - sellerWallet │
                                            │  - price        │
                                            └─────────────────┘
                                                     │
                                                     │
                ┌────────────────────────────────────┘
                │
                │ Initiate Token Transfer
                │
                ▼
┌─────────────────────────────────────────────┐
│          BLOCKCHAIN (Sepolia)               │
│                                             │
│  Smart Contract: KindToken                  │
│  Function: transfer(sellerWallet, 50*10^18)│
│                                             │
│  1. Check buyer balance >= 50 ✓            │
│  2. Deduct 50 from buyer                   │
│  3. Add 50 to seller                       │
│  4. Emit Transfer event                    │
│  5. Return transaction hash                │
│                                             │
│  Changes:                                  │
│  - Buyer: 100 → 50 KSTT                    │
│  - Seller: 0 → 50 KSTT                     │
│                                             │
│  Gas paid by: Backend wallet               │
│  Time: ~15-30 seconds                      │
└─────────────┬───────────────────────────────┘
              │
              │ Transaction Receipt
              │
              ▼
┌──────────────┐
│   Backend    │
│              │
│ Create Order:│
│ - txHash     │
│ - buyer      │
│ - seller     │
│ - amount     │
│ - status     │
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│    MongoDB      │
│  Save Order:    │
│  - orderItems   │
│  - totalAmount  │
│  - web3TxHash   │
│  - buyerWallet  │
│  - sellerWallet │
│  - tokenTrans   │
│    ferred: 50   │
└─────────────────┘
       │
       │
       ▼
┌──────────────┐    Return Order             ┌──────────────┐
│   Backend    │──────────────────────────────▶│   Frontend   │
│              │    {order, txHash}           │              │
└──────────────┘                              └──────┬───────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │  Success Page   │
                                            │  - Order ID     │
                                            │  - TX Hash      │
                                            │  - View on      │
                                            │    Etherscan    │
                                            └─────────────────┘

Total Time: ~30-45 seconds
Gas Cost: ~0.00015 ETH (Sepolia)
Result: Tokens transferred, order created, both parties updated
```

### Workflow 3: Publishing Products

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLISH PRODUCT FLOW                         │
└─────────────────────────────────────────────────────────────────┘

Step 1: Navigate to Publish Page
┌──────────────┐    Click "Publish Product"  ┌──────────────┐
│     User     │──────────────────────────────▶│   Frontend   │
│  (Logged In) │                              │  /product/   │
│              │                              │   publish    │
└──────────────┘                              └──────────────┘

Step 2: Fill Product Form
┌──────────────┐    Enter Details            ┌──────────────┐
│     User     │──────────────────────────────▶│   Form       │
│              │    - Name                     │              │
│              │    - Description              │  Validation: │
│              │    - Price (KSTT)             │  - Required  │
│              │    - Category                 │  - Format    │
│              │    - Stock                    │  - Range     │
│              │    - Images                   │              │
└──────┬───────┘                              └──────────────┘
       │
       │ Submit Form
       │
       ▼
┌──────────────┐  POST /api/v1/admin/        ┌──────────────┐
│   Frontend   │  product/new                 │   Backend    │
│              │──────────────────────────────▶│              │
│              │  Body:                        │  1. Auth     │
│              │  - name                       │     check    │
│              │  - price                      │              │
│              │  - description                │  2. Validate │
│              │  - category                   │     data     │
│              │  - stock                      │              │
│              │  - seller                     │  3. Get user │
│              │  - images                     │     wallet   │
└──────────────┘                              └──────┬───────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │    MongoDB      │
                                            │  Create Product:│
                                            │  - name         │
                                            │  - price        │
                                            │  - description  │
                                            │  - category     │
                                            │  - stock        │
                                            │  - seller       │
                                            │  - sellerWallet │
                                            │  - user (ref)   │
                                            │  - images       │
                                            └─────────────────┘
                                                     │
                                                     │
       ┌─────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐    Return Product           ┌──────────────┐
│   Backend    │──────────────────────────────▶│   Frontend   │
│              │    {product}                 │              │
└──────────────┘                              └──────┬───────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │  Redirect to:   │
                                            │  /me/products   │
                                            │                 │
                                            │  Show Success   │
                                            │  Message        │
                                            └─────────────────┘

Total Time: ~500ms
Storage: MongoDB only (no blockchain needed for product listing)
```

---

## 🔒 Security Architecture

### Authentication & Authorization

#### JWT Token Flow
```
1. User Login
   └─ POST /api/v1/login
      └─ Verify email + password (bcrypt)
         └─ Generate JWT token
            └─ Token Payload: {id: user._id}
            └─ Secret: process.env.JWT_SECRET
            └─ Expiry: 7 days
            └─ Store in HTTP-only cookie

2. Protected Routes
   └─ Request with JWT cookie
      └─ Middleware: isAuthenticatedUser
         └─ Verify token
            └─ Decode user ID
               └─ Fetch user from DB
                  └─ Attach to req.user
                     └─ Proceed to controller

3. Role-Based Access
   └─ Middleware: authorizeRoles(...roles)
      └─ Check req.user.role
         └─ Allow/Deny based on role
```

#### Password Security
```yaml
Hashing Algorithm: bcrypt
Salt Rounds: 10
Min Length: 6 characters
Storage: Never stored in plain text
Comparison: bcrypt.compare() for login
Reset Tokens: SHA256 hashed, 30-min expiry
```

### Web3 Security

#### Private Key Management
```yaml
Storage Location: backend/config/config.env
Access: Server-side only, never exposed
Environment: .env file in .gitignore
Backup: Secure offline storage
Rotation: Regular key rotation recommended
```

#### Wallet Address Validation
```javascript
// Format validation
const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Ethers.js validation
import { ethers } from 'ethers';
const isValid = ethers.isAddress(address);
```

#### Transaction Security
```yaml
Gas Limit: Automatic estimation with 20% buffer
Gas Price: Dynamic based on network
Nonce Management: Automatic by ethers.js
Confirmation: Wait for 1 block confirmation
Error Handling: Comprehensive try-catch blocks
Retry Logic: Exponential backoff for failures
```

### Data Protection

#### MongoDB Security
```yaml
Connection: Localhost or authenticated remote
Indexes: Unique constraints on email, walletAddress
Validation: Mongoose schema validation
Sanitization: Express middleware for input
Injection Prevention: Parameterized queries
```

#### API Security
```yaml
CORS: Configured for frontend domain only
Rate Limiting: To be implemented (recommended)
Helmet: Security headers (recommended)
Input Validation: Required fields, type checking
Error Messages: Generic messages, no sensitive data
```

### Best Practices Implemented
- ✅ Environment variables for secrets
- ✅ Password hashing with bcrypt
- ✅ JWT with HTTP-only cookies
- ✅ Wallet address normalization (lowercase)
- ✅ Mongoose schema validation
- ✅ Error handling middleware
- ✅ Private key never exposed to frontend
- ✅ Transaction confirmation waiting

### Recommended Enhancements
- [ ] Rate limiting (express-rate-limit)
- [ ] CSRF protection
- [ ] API key authentication for admin routes
- [ ] 2FA for user accounts
- [ ] Multi-signature wallet for high-value operations
- [ ] Audit logging for all transactions

---

## ⚙️ Environment Configuration

### Backend Configuration
**File**: `backend/config/config.env`

```bash
# Server Configuration
PORT=4000
NODE_ENV=DEVELOPMENT
FRONTEND_URL=http://localhost:3000

# Database
DB_LOCAL_URI=mongodb://127.0.0.1:27017/shopit-v2
DB_URI=                              # Optional: MongoDB Atlas URI

# Web3 Configuration (REQUIRED for blockchain features)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
CONTRACT_ADDRESS=0x...               # Deployed KindToken contract address
PRIVATE_KEY=0x...                    # Backend wallet private key (KEEP SECRET!)

# JWT Configuration
JWT_SECRET=YOUR_RANDOM_SECRET_STRING_HERE
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRES_TIME=7

# Email Configuration (Optional)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=noreply@kindshare.com
SMTP_FROM_NAME=KindShare

# Cloudinary Configuration (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Legacy Payment (Optional - backward compatibility)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Blockchain Verification (Optional)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

### Frontend Configuration
**File**: `frontend/.env`

```bash
# Server Port
PORT=3000
BROWSER=none                         # Prevent auto-opening browser

# API Endpoint (proxy configured in package.json)
REACT_APP_API_URL=http://localhost:4000
```

### Hardhat Configuration
**File**: `hardhat.config.js`

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "backend/config/config.env" });

module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

---

## 📁 Project Structure

```
Kindshare4.0/
├── backend/
│   ├── app.js                          # Express app setup
│   ├── package.json                    # Backend dependencies
│   ├── config/
│   │   ├── config.env                  # Environment variables
│   │   ├── dbConnect.js                # MongoDB connection
│   │   └── web3Config.js               # Web3 provider & contract setup
│   ├── contracts/
│   │   └── KindToken.sol               # ERC20 smart contract
│   ├── controllers/
│   │   ├── authControllers.js          # Auth logic (register, login)
│   │   ├── orderControllers.js         # Order creation & management
│   │   ├── paymentControllers.js       # Traditional payment (Stripe)
│   │   ├── productControllers.js       # Product CRUD operations
│   │   └── web3Controllers.js          # Web3 operations (mint, transfer)
│   ├── middlewares/
│   │   ├── auth.js                     # JWT authentication
│   │   ├── catchAsyncErrors.js         # Async error wrapper
│   │   └── errors.js                   # Error handling middleware
│   ├── models/
│   │   ├── user.js                     # User schema (with wallet)
│   │   ├── product.js                  # Product schema
│   │   └── order.js                    # Order schema (with web3 fields)
│   ├── routes/
│   │   ├── auth.js                     # Auth endpoints
│   │   ├── order.js                    # Order endpoints
│   │   ├── payment.js                  # Payment endpoints
│   │   ├── products.js                 # Product endpoints
│   │   └── web3.js                     # Web3 endpoints
│   ├── scripts/
│   │   └── deploy.js                   # Contract deployment script
│   ├── seeder/
│   │   ├── data.js                     # Seed data
│   │   └── seeder.js                   # DB seeder script
│   └── utils/
│       ├── apiFilters.js               # Search, filter, pagination
│       ├── cloudinary.js               # Image upload utility
│       ├── emailTemplates.js           # Email HTML templates
│       ├── errorHandler.js             # Custom error class
│       ├── sendEmail.js                # Email sending utility
│       ├── sendToken.js                # JWT token utility
│       └── web3Service.js              # Web3 helper functions
│
├── frontend/
│   ├── package.json                    # Frontend dependencies
│   ├── public/
│   │   ├── index.html                  # HTML template
│   │   └── images/                     # Static images
│   └── src/
│       ├── App.js                      # Main React component
│       ├── index.js                    # React entry point
│       ├── components/
│       │   ├── Home.jsx                # Homepage
│       │   ├── auth/
│       │   │   ├── Login.jsx           # Login form
│       │   │   ├── Register.jsx        # Registration + wallet
│       │   │   ├── ProtectedRoute.jsx  # Route guard
│       │   │   ├── ForgotPassword.jsx
│       │   │   └── ResetPassword.jsx
│       │   ├── cart/
│       │   │   ├── Cart.jsx            # Shopping cart
│       │   │   ├── ConfirmOrder.jsx    # Checkout (with crypto option)
│       │   │   ├── Shipping.jsx        # Shipping form
│       │   │   └── PaymentMethod.jsx   # Payment selection
│       │   ├── product/
│       │   │   ├── ProductDetails.jsx  # Single product page
│       │   │   ├── PublishProduct.jsx  # Create product form
│       │   │   └── MyProducts.jsx      # User's product list
│       │   ├── order/
│       │   │   ├── MyOrders.jsx        # User's orders
│       │   │   └── OrderDetails.jsx    # Single order details
│       │   ├── user/
│       │   │   ├── Profile.jsx         # User profile
│       │   │   ├── UpdateProfile.jsx
│       │   │   └── UpdatePassword.jsx
│       │   ├── layout/
│       │   │   ├── Header.jsx          # Navigation bar
│       │   │   ├── Footer.jsx
│       │   │   └── MetaMaskButton.jsx  # Wallet connection button
│       │   └── admin/
│       │       ├── Dashboard.jsx       # Admin dashboard
│       │       ├── ListProducts.jsx    # All products management
│       │       ├── ListOrders.jsx      # All orders management
│       │       └── ListUsers.jsx       # User management
│       ├── hooks/
│       │   └── useWeb3.js              # MetaMask integration hook
│       ├── redux/
│       │   ├── store.js                # Redux store configuration
│       │   ├── features/
│       │   │   ├── userSlice.js        # User state
│       │   │   ├── cartSlice.js        # Cart state
│       │   │   └── web3Slice.js        # Web3 state
│       │   └── api/
│       │       ├── authApi.js          # Auth RTK Query
│       │       ├── productsApi.js      # Products RTK Query
│       │       ├── orderApi.js         # Orders RTK Query
│       │       └── web3Api.js          # Web3 RTK Query
│       ├── constants/
│       │   └── constants.js            # App constants
│       └── helpers/
│           └── helpers.js              # Utility functions
│
├── hardhat.config.js                   # Hardhat configuration
├── package.json                        # Root package.json
├── .gitignore                          # Git ignore file
├── README.md                           # Basic readme
└── ARCHITECTURE.md                     # This file
```

---

## 🚀 Deployment Guide

### Prerequisites

1. **Install Dependencies**
   ```bash
   # Node.js v18+ and npm
   node --version
   npm --version
   
   # MongoDB v6+
   mongod --version
   
   # MetaMask browser extension
   # Sepolia testnet ETH (from faucet)
   ```

2. **Get API Keys**
   - Infura: https://infura.io (for RPC URL)
   - Etherscan: https://etherscan.io (for contract verification)
   - Cloudinary: https://cloudinary.com (optional, for images)

### Step 1: Smart Contract Deployment

```bash
# 1. Get Sepolia testnet ETH
# Visit: https://sepoliafaucet.com
# Enter your wallet address
# Receive 0.5 Sepolia ETH

# 2. Install Hardhat dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 3. Initialize Hardhat (if not done)
npx hardhat init

# 4. Configure hardhat.config.js
# Add your SEPOLIA_RPC_URL and PRIVATE_KEY to config.env

# 5. Compile contract
npx hardhat compile

# 6. Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Output:
# KindToken deployed to: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
# Save this address!

# 7. Verify contract on Etherscan (optional but recommended)
npx hardhat verify --network sepolia 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# 8. Update config.env with CONTRACT_ADDRESS
```

### Step 2: Backend Setup

```bash
# 1. Navigate to project root
cd c:\Users\Admin\Kindshare4.0

# 2. Install backend dependencies
npm install

# 3. Configure environment variables
# Edit: backend/config/config.env
# Add all required variables (see Environment Configuration section)

# 4. Start MongoDB
mongod
# Or use MongoDB Compass / Atlas

# 5. Seed database (optional)
npm run seeder

# 6. Start backend server
npm run dev
# Or: npm start (production mode)

# Server should start on http://localhost:4000
# Check: curl http://localhost:4000
```

### Step 3: Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Create .env file
echo "PORT=3000" > .env
echo "BROWSER=none" >> .env

# 4. Start development server
npm start

# Frontend should start on http://localhost:3000
# Or auto-select port 3001/3002 if 3000 is busy

# 5. Install MetaMask extension (if not installed)
# Chrome: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org
```

### Step 4: MetaMask Configuration

```bash
# 1. Open MetaMask
# 2. Click network dropdown → Add Network
# 3. Enter Sepolia details:
#    - Network Name: Sepolia Testnet
#    - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
#    - Chain ID: 11155111
#    - Currency Symbol: ETH
#    - Block Explorer: https://sepolia.etherscan.io

# 4. Import backend wallet (for testing only!)
#    - Settings → Import Account
#    - Enter PRIVATE_KEY from config.env
#    - This account will have the initial KSTT supply

# 5. Create test user account
#    - Create new account in MetaMask
#    - Get Sepolia ETH from faucet (not required but good to have)
```

### Step 5: Testing

```bash
# Test Flow 1: User Registration
1. Open http://localhost:3000/register
2. Enter name, email, password
3. Click Register
4. Should redirect to home, logged in

# Test Flow 2: Wallet Connection
1. Click "Connect Wallet" button
2. MetaMask popup → Connect
3. Wait ~30 seconds
4. Check MetaMask → Should show 100 KSTT tokens

# Test Flow 3: Publish Product
1. Navigate to /product/publish
2. Fill in product details:
   - Name: Test Product
   - Price: 50 (KSTT)
   - Description: Test description
   - Category: Electronics
   - Stock: 10
3. Submit
4. Navigate to /me/products
5. Verify product appears

# Test Flow 4: Purchase Product
1. Logout, create second user account
2. Connect new MetaMask wallet
3. Wait for 100 KSTT airdrop
4. Browse products, find test product
5. Add to cart, checkout
6. Select "Pay with KSTT"
7. Wait ~30 seconds for transaction
8. Check order in /me/orders
9. Verify transaction hash on Etherscan
10. Check MetaMask balances:
    - Buyer: 50 KSTT (100 - 50)
    - Seller: 150 KSTT (100 + 50)
```

---

## 📊 Performance Metrics

### Expected Response Times

| Operation | Time | Notes |
|-----------|------|-------|
| User Registration | 200-500ms | Database write |
| User Login | 100-300ms | DB query + JWT generation |
| Product Listing | 100-500ms | Depends on page size |
| Product Creation | 200-800ms | With image upload: 2-5s |
| Wallet Connection | 30-45s | Blockchain transaction |
| Token Transfer | 30-45s | Blockchain transaction |
| Order Creation (Traditional) | 500-1000ms | Database only |
| Order Creation (Crypto) | 30-45s | Includes blockchain tx |

### Blockchain Costs (Sepolia)

| Operation | Gas Used | Cost (ETH) | Cost (USD @ $2000/ETH) |
|-----------|----------|------------|------------------------|
| Contract Deployment | ~1,500,000 | 0.003 | $6 |
| Mint Tokens | ~50,000 | 0.0001 | $0.20 |
| Transfer Tokens | ~30,000 | 0.00006 | $0.12 |

**Note**: Mainnet costs would be ~10-50x higher depending on network congestion.

### Scalability Considerations

**Current Limitations**:
- Backend handles all blockchain transactions (bottleneck)
- Single admin wallet pays all gas fees
- Sequential transaction processing
- No caching layer for token balances

**Recommended Improvements**:
- Implement Redis caching for frequent queries
- Use worker queues for blockchain transactions (Bull/BullMQ)
- Implement token balance caching with periodic sync
- Add CDN for static assets
- Implement database indexing optimization
- Consider Layer 2 solutions (Polygon, Optimism) for lower gas fees

---

## 🧪 Testing Strategy

### Manual Testing Checklist

```markdown
□ Backend
  □ Server starts without errors
  □ MongoDB connection successful
  □ Web3 provider initialized
  □ All routes respond correctly
  □ JWT authentication works
  □ Error handling returns proper messages

□ Frontend
  □ App loads without console errors
  □ Navigation works
  □ Forms validate input
  □ MetaMask integration functional
  □ State management (Redux) working
  □ API calls succeed

□ Smart Contract
  □ Deployed successfully
  □ Verified on Etherscan
  □ Minting works
  □ Transfers work
  □ Balance queries accurate
  □ Events emitted correctly

□ End-to-End Flows
  □ Registration → Wallet → Token receipt
  □ Product publishing
  □ Product browsing & search
  □ Cart operations
  □ Checkout with crypto payment
  □ Order history display
  □ Transaction verification on Etherscan
```

### Automated Testing (To Be Implemented)

```javascript
// Recommended test structure

// Backend Unit Tests (Jest/Mocha)
- Auth Controllers
  - registerUser
  - loginUser
  - logout
- Web3 Controllers
  - connectWallet
  - mintTokens
  - transferTokens
- Order Controllers
  - createOrder
  - getOrders
  - updateOrderStatus

// Smart Contract Tests (Hardhat)
- KindToken
  - Deployment
  - Minting (owner only)
  - Transfers
  - Balance queries
  - Access control

// Frontend Tests (React Testing Library)
- Components
  - Register form
  - Login form
  - Product card
  - Cart functionality
- Hooks
  - useWeb3
- Redux
  - Slices
  - API integration

// Integration Tests
- Full user journey
- Payment flow
- Wallet connection
```

---

## 📈 Future Enhancements

### Phase 2 Features

1. **Token Economics**
   - [ ] Staking mechanism (earn rewards)
   - [ ] Token burning for premium features
   - [ ] Referral rewards
   - [ ] Loyalty program with token bonuses

2. **Social Features**
   - [ ] User reputation system
   - [ ] Product reviews with token incentives
   - [ ] Seller ratings
   - [ ] Chat/messaging between users

3. **Advanced Trading**
   - [ ] Token swap (KSTT ↔ ETH)
   - [ ] Auction system
   - [ ] Bid/offer functionality
   - [ ] Escrow service for high-value items

4. **DAO Governance**
   - [ ] Token-based voting
   - [ ] Community proposals
   - [ ] Platform fee adjustments
   - [ ] Feature prioritization

5. **NFT Integration**
   - [ ] Product authenticity certificates
   - [ ] Limited edition items as NFTs
   - [ ] Digital collectibles marketplace
   - [ ] NFT-gated products

### Technical Improvements

1. **Performance**
   - [ ] Redis caching layer
   - [ ] Database query optimization
   - [ ] CDN for static assets
   - [ ] Image optimization (WebP, lazy loading)
   - [ ] Server-side rendering (Next.js migration)

2. **Security**
   - [ ] Multi-signature wallet for admin operations
   - [ ] Rate limiting
   - [ ] CSRF protection
   - [ ] 2FA for user accounts
   - [ ] Smart contract auditing

3. **Scalability**
   - [ ] Microservices architecture
   - [ ] Message queue for async operations
   - [ ] Horizontal scaling (load balancer)
   - [ ] Database replication
   - [ ] Layer 2 migration (Polygon, Optimism)

4. **DevOps**
   - [ ] CI/CD pipeline
   - [ ] Automated testing
   - [ ] Docker containerization
   - [ ] Kubernetes orchestration
   - [ ] Monitoring (Grafana, Prometheus)

5. **User Experience**
   - [ ] Mobile app (React Native)
   - [ ] Progressive Web App (PWA)
   - [ ] Multi-language support (i18n)
   - [ ] Dark mode
   - [ ] Accessibility improvements (WCAG)

---

## 🐛 Troubleshooting Guide

### Common Issues

#### 1. "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or specify data directory
mongod --dbpath /path/to/data

# Check connection string in config.env
DB_LOCAL_URI=mongodb://127.0.0.1:27017/shopit-v2
```

#### 2. "Web3 provider not initialized"
```bash
# Check environment variables
- SEPOLIA_RPC_URL is set
- CONTRACT_ADDRESS is set
- PRIVATE_KEY is set

# Verify RPC URL is accessible
curl https://sepolia.infura.io/v3/YOUR_KEY

# Check private key format (should start with 0x)
PRIVATE_KEY=0x...
```

#### 3. "MetaMask connection failed"
```bash
# Ensure MetaMask is installed
# Check network is set to Sepolia
# Try disconnecting and reconnecting
# Clear browser cache
# Check console for detailed errors
```

#### 4. "Token minting failed"
```bash
# Check backend wallet has Sepolia ETH
# Verify contract address is correct
# Check private key has permission to mint
# View transaction error on Etherscan
# Ensure contract is deployed
```

#### 5. "Transaction taking too long"
```bash
# Sepolia transactions take 15-30 seconds
# Check network status: https://sepolia.etherscan.io
# Check transaction on Etherscan using hash
# If pending > 5 minutes, may need to resubmit with higher gas
```

#### 6. "Port already in use"
```bash
# Backend (port 4000)
netstat -ano | findstr :4000
taskkill /F /PID <PID>

# Frontend (port 3000)
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Or set different port in .env
PORT=3001
```

---

## 📞 Support & Resources

### Documentation
- **Project Docs**: See `/docs` folder (to be created)
- **API Docs**: Postman collection (to be created)
- **Smart Contract**: Verified on Etherscan

### External Resources
- **Ethers.js**: https://docs.ethers.org/v6/
- **Hardhat**: https://hardhat.org/docs
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **React**: https://react.dev/
- **Redux Toolkit**: https://redux-toolkit.js.org/
- **MongoDB**: https://www.mongodb.com/docs/
- **Express**: https://expressjs.com/

### Community
- **GitHub**: [Repository URL]
- **Discord**: [Server link - to be created]
- **Twitter**: [Handle - to be created]

---

## 📄 License & Credits

### License
This project is licensed under [Your License] - see LICENSE file for details

### Credits
- **Smart Contract**: OpenZeppelin ERC20 implementation
- **Frontend**: React, Redux Toolkit
- **Backend**: Express.js, MongoDB
- **Web3**: Ethers.js
- **Development**: Hardhat

### Contributors
- [Your Name/Team]

---

## 📅 Version History

### Version 4.0.0 (Current)
- Initial Web3 integration
- MetaMask wallet support
- KSTT token implementation
- Token-based purchases
- Product publishing feature
- Dual payment system

### Version 3.0.0 (Previous)
- Traditional e-commerce features
- User authentication
- Product management
- Order processing
- Payment integration (Stripe)

---

**Last Updated**: November 27, 2025  
**Maintainer**: [Your Name]  
**Status**: Active Development  
**Network**: Sepolia Testnet  
**Next Release**: TBD
