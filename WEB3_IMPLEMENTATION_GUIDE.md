# Kindshare Web3 集成完整实现指南

## 🎯 项目目标
将Web2电子商务平台升级为Web3共享经济平台，集成虚拟社区代币系统，用户可通过MetaMask钱包进行代币交易。

## 📊 实现功能清单
- ✅ 用户注册时获得初始代币
- ✅ MetaMask钱包连接与代币查询
- ✅ 购买商品时代币转账
- ✅ 商品卖家接收代币
- ✅ 用户发布商品
- ✅ 查看我的商品列表

---

## 第一步：依赖安装

### 1.1 后端依赖

```powershell
cd c:\Users\Admin\Kindshare4.0
npm install web3 ethers dotenv
```

### 1.2 前端依赖

```powershell
cd frontend
npm install web3 ethers redux-persist
```

---

## 第二步：智能合约开发

### 2.1 创建Solidity合约文件

**文件位置**: `backend/contracts/KindToken.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KindToken is ERC20, Ownable {
    constructor() ERC20("Kind Share Token", "KSTT") {
        // 初始总供应量: 1000万个代币
        _mint(msg.sender, 10000000 * 10 ** 18);
    }

    // 铸造新代币 (仅管理员)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // 销毁代币
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    // 获取用户余额
    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }

    // 用户转账代币
    function transfer(address to, uint256 amount) public override returns (bool) {
        return super.transfer(to, amount);
    }

    // 授权转账
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }
}
```

### 2.2 部署合约

1. **安装Hardhat**
```powershell
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

2. **配置hardhat.config.js**

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

3. **部署脚本** `backend/scripts/deploy.js`

```javascript
async function main() {
  const KindToken = await ethers.getContractFactory("KindToken");
  const kindToken = await KindToken.deploy();
  await kindToken.deployed();
  console.log("KindToken deployed to:", kindToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

4. **部署命令**
```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 第三步：后端数据库模型修改

### 3.1 修改User模型 (models/user.js)

添加钱包地址字段：

```javascript
const userSchema = new mongoose.Schema({
  // ... 现有字段 ...
  walletAddress: {
    type: String,
    default: null,
    unique: true,
    sparse: true
  },
  tokenBalance: {
    type: Number,
    default: 100  // 新用户注册获得100个代币
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
}, { timestamps: true });
```

### 3.2 修改Product模型 (models/product.js)

添加卖家钱包地址：

```javascript
const productSchema = new mongoose.Schema({
  // ... 现有字段 ...
  sellerWallet: {
    type: String,
    required: false
  },
  sellerUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  }
}, { timestamps: true });
```

### 3.3 修改Order模型 (models/order.js)

添加Web3交易字段：

```javascript
const orderSchema = new mongoose.Schema({
  // ... 现有字段 ...
  web3TransactionHash: {
    type: String,
    default: null
  },
  tokenTransferred: {
    type: Number,
    default: 0
  },
  buyerWallet: String,
  sellerWallet: String,
  paymentType: {
    type: String,
    enum: ["traditional", "crypto"],
    default: "crypto"
  }
}, { timestamps: true });
```

---

## 第四步：后端Web3服务

### 4.1 创建Web3配置文件 (backend/config/web3Config.js)

```javascript
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: "backend/config/config.env" });

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = JSON.parse(process.env.CONTRACT_ABI);
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

export const getContract = () => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
};

export const provider_instance = provider;
export const wallet_instance = wallet;
```

### 4.2 创建Web3服务文件 (backend/utils/web3Service.js)

```javascript
import { ethers } from "ethers";
import { getContract, provider_instance, wallet_instance } from "../config/web3Config.js";
import User from "../models/user.js";

// 转账代币
export const transferTokens = async (toAddress, amount) => {
  try {
    const contract = getContract();
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
    
    const tx = await contract.transfer(toAddress, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Token transfer error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 查询代币余额
export const getTokenBalance = async (address) => {
  try {
    const contract = getContract();
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 18);
  } catch (error) {
    console.error("Balance query error:", error);
    return 0;
  }
};

// 新用户注册时铸造代币
export const mintTokensForNewUser = async (userWalletAddress, amount = 100) => {
  try {
    const contract = getContract();
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
    
    const tx = await contract.mint(userWalletAddress, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Mint error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 处理购买交易
export const handlePurchaseTransaction = async (buyerWallet, sellerWallet, amount) => {
  try {
    const contract = getContract();
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
    
    // 从买家转给卖家
    const tx = await contract.transferFrom(buyerWallet, sellerWallet, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Purchase transaction error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

### 4.3 创建Web3路由 (backend/routes/web3.js)

```javascript
import express from "express";
import { 
  connectWallet, 
  getWalletBalance, 
  mintTokens 
} from "../controllers/web3Controllers.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.post("/wallet/connect", isAuthenticatedUser, connectWallet);
router.get("/wallet/balance/:address", getWalletBalance);
router.post("/tokens/mint", isAuthenticatedUser, mintTokens);

export default router;
```

### 4.4 创建Web3控制器 (backend/controllers/web3Controllers.js)

```javascript
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import { 
  transferTokens, 
  getTokenBalance, 
  mintTokensForNewUser 
} from "../utils/web3Service.js";
import ErrorHandler from "../utils/errorHandler.js";

// 连接钱包
export const connectWallet = catchAsyncErrors(async (req, res, next) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return next(new ErrorHandler("Wallet address is required", 400));
  }

  // 验证钱包地址格式
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return next(new ErrorHandler("Invalid wallet address format", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { walletAddress },
    { new: true }
  );

  // 为用户铸造初始代币
  await mintTokensForNewUser(walletAddress, 100);

  res.status(200).json({
    success: true,
    user
  });
});

// 获取钱包余额
export const getWalletBalance = catchAsyncErrors(async (req, res, next) => {
  const { address } = req.params;

  const balance = await getTokenBalance(address);

  res.status(200).json({
    success: true,
    balance,
    address
  });
});

// 铸造代币 (管理员)
export const mintTokens = catchAsyncErrors(async (req, res, next) => {
  const { userWallet, amount } = req.body;

  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Only admin can mint tokens", 403));
  }

  const result = await mintTokensForNewUser(userWallet, amount);

  if (!result.success) {
    return next(new ErrorHandler(result.error, 500));
  }

  res.status(200).json({
    success: true,
    transactionHash: result.transactionHash
  });
});
```

### 4.5 修改订单控制器 (backend/controllers/orderControllers.js)

在 `newOrder` 函数中添加Web3交易逻辑：

```javascript
export const newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
    buyerWallet,
    sellerWallet
  } = req.body;

  let transactionHash = null;
  let paymentType = "traditional";

  // 如果使用加密支付
  if (buyerWallet && sellerWallet) {
    paymentType = "crypto";
    
    // 调用Web3交易
    const txResult = await handlePurchaseTransaction(
      buyerWallet,
      sellerWallet,
      totalAmount
    );

    if (!txResult.success) {
      return next(new ErrorHandler("Crypto payment failed: " + txResult.error, 500));
    }

    transactionHash = txResult.transactionHash;
  }

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
    user: req.user._id,
    web3TransactionHash: transactionHash,
    tokenTransferred: paymentType === "crypto" ? totalAmount : 0,
    buyerWallet,
    sellerWallet,
    paymentType
  });

  res.status(200).json({
    order
  });
});
```

---

## 第五步：前端集成

### 5.1 创建Web3 Hook (frontend/src/hooks/useWeb3.js)

```javascript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    checkIfConnected();
  }, []);

  const checkIfConnected = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setProvider(provider);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask');
        return null;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setAccount(accounts[0]);
      setIsConnected(true);
      setProvider(provider);

      return accounts[0];
    } catch (error) {
      console.error('Connection error:', error);
      return null;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0');
    setIsConnected(false);
    setProvider(null);
  };

  const getBalance = async (address = account) => {
    try {
      if (!provider || !address) return '0';
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);
      setBalance(balanceInEth);
      return balanceInEth;
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  return {
    account,
    balance,
    isConnected,
    provider,
    connectWallet,
    disconnectWallet,
    getBalance
  };
};
```

### 5.2 创建Redux Slice (frontend/src/redux/features/web3Slice.js)

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  account: null,
  balance: '0',
  isConnected: false,
  loading: false,
  error: null
};

const web3Slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload;
    },
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setIsConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearWeb3: (state) => {
      return initialState;
    }
  }
});

export const {
  setAccount,
  setBalance,
  setIsConnected,
  setLoading,
  setError,
  clearWeb3
} = web3Slice.actions;

export default web3Slice.reducer;
```

### 5.3 创建Web3 API (frontend/src/redux/api/web3Api.js)

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const web3Api = createApi({
  reducerPath: 'web3Api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      // 自动添加认证令牌
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    connectWallet: builder.mutation({
      query: (data) => ({
        url: '/wallet/connect',
        method: 'POST',
        body: data,
      }),
    }),
    getWalletBalance: builder.query({
      query: (address) => `/wallet/balance/${address}`,
    }),
    mintTokens: builder.mutation({
      query: (data) => ({
        url: '/tokens/mint',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useConnectWalletMutation,
  useGetWalletBalanceQuery,
  useMintTokensMutation,
} = web3Api;
```

### 5.4 修改Store (frontend/src/redux/store.js)

```javascript
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import cartReducer from "./features/cartSlice";
import web3Reducer from "./features/web3Slice";
import { web3Api } from "./api/web3Api";
import { productApi } from "./api/productsApi";
import { authApi } from "./api/authApi";
import { userApi } from "./api/userApi";
import { orderApi } from "./api/orderApi";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    cart: cartReducer,
    web3: web3Reducer,
    [web3Api.reducerPath]: web3Api.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      web3Api.middleware,
      productApi.middleware,
      authApi.middleware,
      userApi.middleware,
      orderApi.middleware,
    ]),
});
```

### 5.5 修改注册组件 (frontend/src/components/auth/Register.jsx)

添加MetaMask连接逻辑：

```javascript
import { useWeb3 } from '../../hooks/useWeb3';
import { useConnectWalletMutation } from '../../redux/api/web3Api';

export const Register = () => {
  const { connectWallet } = useWeb3();
  const [connectWalletMutation] = useConnectWalletMutation();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 连接MetaMask钱包
    const walletAddress = await connectWallet();
    
    if (!walletAddress) {
      alert('Please connect your MetaMask wallet');
      return;
    }

    // 1. 先在后端注册用户
    const registerResult = await registerUserAPI(formData);
    
    if (registerResult.success) {
      // 2. 连接钱包到用户账户
      await connectWalletMutation({ walletAddress });
      
      // 3. 重定向到首页
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      {/* 表单字段 */}
      <button type="button" onClick={() => connectWallet()}>
        连接钱包
      </button>
      <button type="submit">注册</button>
    </form>
  );
};
```

### 5.6 创建发布商品组件 (frontend/src/components/product/PublishProduct.jsx)

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const PublishProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/v1/admin/product/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('商品发布成功');
        navigate('/me/products');
      } else {
        toast.error(data.message || '发布失败');
      }
    } catch (error) {
      toast.error('错误: ' + error.message);
    }
  };

  return (
    <div className="container">
      <h2>发布商品</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="商品名称"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="商品描述"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="价格 (代币)"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="Electronics">电子产品</option>
          <option value="Books">书籍</option>
          <option value="Clothing">服装</option>
          <option value="Home">家居</option>
          <option value="Sports">运动</option>
        </select>
        <input
          type="number"
          name="stock"
          placeholder="库存"
          value={formData.stock}
          onChange={handleChange}
          required
        />
        <button type="submit">发布商品</button>
      </form>
    </div>
  );
};
```

### 5.7 创建用户商品列表组件 (frontend/src/components/product/MyProducts.jsx)

```javascript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const response = await fetch('/api/v1/me/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="container">
      <h2>我的商品</h2>
      <button onClick={() => navigate('/product/publish')}>发布新商品</button>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <img src={product.images[0]?.url} alt={product.name} />
            <h3>{product.name}</h3>
            <p>价格: {product.price} KSTT</p>
            <p>库存: {product.stock}</p>
            <button onClick={() => navigate(`/product/${product._id}/edit`)}>
              编辑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 第六步：配置环境变量

### 6.1 更新 `backend/config/config.env`

```plaintext
PORT=4000
NODE_ENV=DEVELOPMENT
FRONTEND_URL=http://localhost:3000

# Database
DB_LOCAL_URI=mongodb://127.0.0.1:27017/shopit-v2
DB_URI=

# Web3 Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
CONTRACT_ADDRESS=0x... # 部署后的合约地址
CONTRACT_ABI=[...] # 合约ABI (JSON字符串)
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY

# JWT
JWT_SECRET=SJF34390JFKDJFSDKLFJ4F0DSJFKSDJF3049RDFJSDKLFJSKJDFO34
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRES_TIME=7

# Email Configuration
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@shopit.com
SMTP_FROM_NAME=ShopIT

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe (保留向后兼容)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Etherscan (用于合约验证)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

---

## 第七步：测试步骤

### 7.1 获取测试资源

1. **获取Sepolia ETH** (用于支付gas费):
   - 访问 https://sepoliafaucet.com
   - 输入你的钱包地址
   - 获得测试ETH

2. **创建.env文件配置** (获取Infura和Etherscan密钥):
   - 访问 https://infura.io (获取RPC URL)
   - 访问 https://etherscan.io (获取API Key)

### 7.2 启动应用

```powershell
# 终端 1: 启动MongoDB
mongod

# 终端 2: 启动后端
cd c:\Users\Admin\Kindshare4.0
npm run dev

# 终端 3: 启动前端
cd frontend
npm start
```

### 7.3 完整测试流程

#### Step 1: 部署合约
```powershell
npx hardhat run scripts/deploy.js --network sepolia
# 记录返回的合约地址，填入config.env
```

#### Step 2: 测试用户1 (管理员)
1. 打开浏览器访问 http://localhost:3000
2. 安装MetaMask扩展（如未安装）
3. 导入第一个钱包账号（设为管理员）
4. 注册账号，选择"管理员角色"
5. 连接MetaMask钱包
6. 验证钱包中收到100个KSTT代币

#### Step 3: 测试用户2 (普通用户)
1. 打开隐私窗口或另一个浏览器
2. 导入第二个钱包账号
3. 注册新账号（普通用户）
4. 连接MetaMask钱包
5. 验证收到100个KSTT代币

#### Step 4: 用户2发布商品
1. 点击"发布商品"
2. 填写商品信息:
   - 名称: "测试商品"
   - 价格: 50 KSTT
   - 描述: "这是测试商品"
   - 库存: 5
3. 点击"发布"

#### Step 5: 用户2查看发布的商品
1. 点击"我的商品"
2. 验证看到刚发布的商品

#### Step 6: 用户1购买商品
1. 返回用户1浏览器
2. 首页搜索"测试商品"
3. 点击商品进入详情页
4. 点击"购买"
5. 选择代币支付方式
6. 确认MetaMask交易

#### Step 7: 验证交易结果
- **用户1 (买家)**:
  - MetaMask余额应减少50 KSTT
  - 订单列表应显示新订单
  
- **用户2 (卖家)**:
  - MetaMask余额应增加50 KSTT
  - 订单历史应显示收到的代币

### 7.4 查看交易详情

在 http://localhost:4000/api/v1 获取订单信息：

```
GET /api/v1/me/orders
```

返回示例:
```json
{
  "orders": [
    {
      "_id": "...",
      "orderItems": [...],
      "totalAmount": 50,
      "tokenTransferred": 50,
      "paymentType": "crypto",
      "web3TransactionHash": "0x...",
      "buyerWallet": "0x...",
      "sellerWallet": "0x...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## 第八步：故障排查

### 问题1: 合约部署失败
```
解决方案:
1. 检查SEPOLIA_RPC_URL是否正确
2. 检查PRIVATE_KEY是否有效
3. 确保钱包有足够的Sepolia ETH (用于gas费)
4. 运行: npx hardhat compile
```

### 问题2: 代币转账失败
```
解决方案:
1. 检查买家钱包余额是否足够
2. 检查卖家钱包地址格式是否正确
3. 检查合约ABI是否与部署的合约匹配
4. 查看后端日志获取详细错误信息
```

### 问题3: MetaMask连接问题
```
解决方案:
1. 检查是否添加了Sepolia网络
2. 点击MetaMask → 网络 → 添加网络
   - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
   - Chain ID: 11155111
   - 货币符号: ETH
3. 切换到Sepolia网络
```

### 问题4: 前端无法连接后端
```
解决方案:
1. 检查前端package.json中的proxy设置
2. 确保后端运行在 http://localhost:4000
3. 检查CORS配置
```

---

## 总结与下一步

### 已完成功能
✅ 用户注册获得初始代币
✅ MetaMask钱包连接
✅ 代币购买商品
✅ 卖家接收代币
✅ 发布商品功能
✅ 查看我的商品

### 可选扩展功能
- [ ] 代币交易市场
- [ ] 代币兑换法币
- [ ] NFT商品认证
- [ ] DAO治理代币
- [ ] 质押获得收益
- [ ] 多链支持

---

**文档最后更新**: 2024年11月
