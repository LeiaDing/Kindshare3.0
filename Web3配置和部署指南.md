# KindShare Web3 配置和部署指南

## 📋 环境变量配置

### 后端环境变量 (.env)

**文件位置：** `backend/config/config.env`

```env
# 基础配置
NODE_ENV=PRODUCTION
PORT=4000

# 数据库
MONGO_URI=mongodb://localhost:27017/kindshare
# 或使用 MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kindshare

# JWT 配置
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRES_TIME=7

# 前端 URL
FRONTEND_URL=http://localhost:3000

# 🌐 Web3/区块链配置 - Sepolia 测试网络
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# 或使用其他 RPC 提供商:
# - Alchemy: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
# - Quicknode: https://YOUR_QUICK_NODE_URL.quiknode.pro
# - Public RPC: https://rpc.sepolia.org

# 🔐 智能合约配置
CONTRACT_ADDRESS=0x5FbDB2315678afccb333f8a9c12c1a6222c20b5e
# 这是部署在 Sepolia 上的 KindToken 合约地址

# 🔑 后端钱包私钥 (拥有 mint 和 transfer 权限)
PRIVATE_KEY=0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0
# ⚠️ 严格保密！绝不要提交到 GitHub
# 这个私钥用于：
# - 铸造新用户的初始代币 (100 个)
# - 接收用户的代币支付

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_FROM_NAME=KindShare
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your_app_password

# Stripe 配置 (用于信用卡支付，可选)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary 配置 (图片上传)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# 可选：日志和监控
LOG_LEVEL=info
SENTRY_DSN=
```

### 前端环境变量

**文件位置：** `frontend/.env` 或 `.env.local`

```env
# API 后端 URL
REACT_APP_API_URL=http://localhost:4000/api/v1

# Web3 配置
REACT_APP_CHAIN_ID=11155111  # Sepolia chain ID
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afccb333f8a9c12c1a6222c20b5e
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

---

## 🛠️ 智能合约部署

### 1. 智能合约代码

**文件位置：** `backend/contracts/KindToken.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KindToken is ERC20, Ownable {
    constructor() ERC20("KindToken", "KT") {
        // 初始铸造一些代币到部署者账户（可选）
        _mint(msg.sender, 1000 * 10 ** 18);  // 1000 个代币
    }

    /**
     * 铸造函数 - 仅 owner 可以调用
     * @param to 接收代币的地址
     * @param amount 代币数量（以最小单位计）
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * 销毁函数
     * @param amount 销毁的代币数量
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

### 2. 部署步骤

**使用 Hardhat 部署到 Sepolia**

#### 2.1 安装依赖

```bash
cd backend
npm install --save-dev hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev @openzeppelin/contracts
npx hardhat
# 选择 "Create a TypeScript project"
```

#### 2.2 配置 Hardhat

**文件：** `hardhat.config.js`

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: "auto"
    },
    hardhat: {
      // 本地测试网络
    }
  }
};
```

#### 2.3 编写部署脚本

**文件：** `backend/scripts/deploy.js`

```javascript
const hre = require("hardhat");

async function main() {
  console.log("开始部署 KindToken 合约...");

  // 获取部署者账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署者地址:", deployer.address);

  // 获取账户余额
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(balance), "ETH");

  // 部署合约
  const KindToken = await hre.ethers.getContractFactory("KindToken");
  const kindToken = await KindToken.deploy();

  await kindToken.waitForDeployment();

  const contractAddress = await kindToken.getAddress();
  console.log("✅ KindToken 合约已部署!");
  console.log("合约地址:", contractAddress);

  // 保存合约地址
  console.log("\n请在 .env 中设置:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);

  // 验证部署
  console.log("\n验证合约信息:");
  const name = await kindToken.name();
  const symbol = await kindToken.symbol();
  const totalSupply = await kindToken.totalSupply();
  console.log("名称:", name);
  console.log("符号:", symbol);
  console.log("总供应量:", hre.ethers.formatEther(totalSupply));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### 2.4 执行部署

```bash
# 编译合约
npx hardhat compile

# 部署到 Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 输出应该是:
# 开始部署 KindToken 合约...
# 部署者地址: 0x...
# 账户余额: 0.5 ETH
# ✅ KindToken 合约已部署!
# 合约地址: 0x5FbDB2315678afccb333f8a9c12c1a6222c20b5e
```

### 3. 验证合约（可选）

```bash
# 在 Etherscan 上验证合约代码
npx hardhat verify --network sepolia 0x5FbDB... "Constructor arguments if any"
```

---

## 🔐 密钥管理

### 1. 生成新的 Ethereum 钱包

```javascript
// 使用 ethers.js
const ethers = require("ethers");

// 生成新钱包
const wallet = ethers.Wallet.createRandom();
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Mnemonic:", wallet.mnemonic.phrase);

// 或导入现有钱包
const importedWallet = new ethers.Wallet("0x123abc...");
console.log("Imported Address:", importedWallet.address);
```

### 2. 获取 Sepolia 测试币

#### 方法 1：使用 Sepolia Faucet

访问以下网址获取免费的 Sepolia ETH：

- **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia
- **Alchemy Faucet**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

#### 方法 2：使用水龙头 API

```javascript
// 使用 curl 请求
curl -X POST https://api.infura.io/faucets/sepolia \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f..."}'
```

### 3. 保护私钥最佳实践

```bash
# ✅ 推荐做法
1. 使用环境变量存储私钥
2. 将 .env 文件添加到 .gitignore
3. 使用 .env.example 文件作为模板

# ❌ 不要做以下事情
1. 将私钥提交到 Git
2. 在代码中硬编码私钥
3. 在不安全的地方分享私钥
4. 在生产环境使用测试钱包私钥

# 💼 生产环境建议
1. 使用 HSM (硬件安全模块)
2. 使用密钥管理服务 (KMS)
3. 使用多签钱包
4. 定期轮换密钥
```

---

## 🧪 测试合约功能

### 1. 本地测试网络

```bash
# 启动 Hardhat 本地网络
npx hardhat node
# 在另一个终端部署
npx hardhat run scripts/deploy.js --network localhost
```

### 2. 测试脚本

**文件：** `backend/scripts/test-mint.js`

```javascript
const hre = require("hardhat");

async function main() {
  // 获取部署者和测试用户
  const [deployer, user1, user2] = await hre.ethers.getSigners();

  console.log("部署者:", deployer.address);
  console.log("用户1:", user1.address);
  console.log("用户2:", user2.address);

  // 获取已部署的合约
  const contractAddress = "0x5FbDB...";  // 使用实际地址
  const kindToken = await hre.ethers.getContractAt(
    "KindToken",
    contractAddress,
    deployer
  );

  // 测试 1: 检查初始供应量
  const totalSupply = await kindToken.totalSupply();
  console.log("\n📊 总供应量:", hre.ethers.formatEther(totalSupply));

  // 测试 2: 为用户1铸造代币
  console.log("\n🪙 为用户1铸造 100 个代币...");
  const mintTx = await kindToken.mint(
    user1.address,
    hre.ethers.parseUnits("100", 18)
  );
  await mintTx.wait();
  console.log("✅ 铸造成功");

  // 测试 3: 检查用户1的余额
  const user1Balance = await kindToken.balanceOf(user1.address);
  console.log("用户1余额:", hre.ethers.formatEther(user1Balance));

  // 测试 4: 用户1转账给用户2
  console.log("\n💸 用户1转账 50 个代币给用户2...");
  const transferTx = await kindToken
    .connect(user1)
    .transfer(
      user2.address,
      hre.ethers.parseUnits("50", 18)
    );
  await transferTx.wait();
  console.log("✅ 转账成功");

  // 测试 5: 检查两个用户的新余额
  const newUser1Balance = await kindToken.balanceOf(user1.address);
  const user2Balance = await kindToken.balanceOf(user2.address);
  console.log("用户1新余额:", hre.ethers.formatEther(newUser1Balance));
  console.log("用户2新余额:", hre.ethers.formatEther(user2Balance));

  // 测试 6: 用户1销毁代币
  console.log("\n🔥 用户1销毁 25 个代币...");
  const burnTx = await kindToken
    .connect(user1)
    .burn(hre.ethers.parseUnits("25", 18));
  await burnTx.wait();
  console.log("✅ 销毁成功");

  const finalUser1Balance = await kindToken.balanceOf(user1.address);
  console.log("用户1最终余额:", hre.ethers.formatEther(finalUser1Balance));
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
```

运行测试：

```bash
npx hardhat run scripts/test-mint.js --network sepolia
```

---

## 📊 区块浏览器查询

### 查看合约信息

访问 Sepolia Etherscan：

```
https://sepolia.etherscan.io/address/0x5FbDB2315678afccb333f8a9c12c1a6222c20b5e
```

### 查看交易详情

```
https://sepolia.etherscan.io/tx/0x123abc...xyz
```

### 查看代币余额

```
https://sepolia.etherscan.io/token/0x5FbDB...?a=0x742d...
```

---

## 🚀 完整部署检查清单

### 准备阶段

- [ ] 创建 Ethereum 钱包
- [ ] 从 Sepolia Faucet 获取测试币
- [ ] 配置 Infura/Alchemy 账户获取 RPC URL
- [ ] 创建 .env 文件，配置所有必要的环境变量
- [ ] 安装 Node.js 依赖: `npm install`

### 智能合约部署

- [ ] 编译合约: `npx hardhat compile`
- [ ] 检查合约代码无误
- [ ] 执行部署脚本: `npx hardhat run scripts/deploy.js --network sepolia`
- [ ] 记录合约地址
- [ ] 更新 .env 文件中的 CONTRACT_ADDRESS
- [ ] 验证合约可以正常调用

### 后端配置

- [ ] 配置 .env 文件所有必要的变量
- [ ] 测试数据库连接: `mongosh`
- [ ] 测试 Web3 连接
- [ ] 运行后端: `npm run dev`
- [ ] 测试 API 端点

### 前端配置

- [ ] 安装依赖: `npm install`
- [ ] 配置 .env.local 文件
- [ ] 运行前端: `npm start`
- [ ] 测试 MetaMask 连接
- [ ] 测试钱包连接和代币铸造

### 完整测试流程

- [ ] **用户注册**: 创建新账户
- [ ] **连接钱包**: 连接 MetaMask
- [ ] **验证代币**: 检查 100 代币是否到账
- [ ] **发布商品**: 创建测试商品
- [ ] **购买商品**: 使用代币进行购买
- [ ] **验证交易**: 检查买家和卖家的代币余额变化
- [ ] **查看历史**: 在 Etherscan 查看交易

---

## 🔧 常见问题解决

### 问题 1: "Web3 contract not initialized"

```
原因: 环境变量未正确设置
解决:
1. 检查 .env 文件
2. 确认 SEPOLIA_RPC_URL、CONTRACT_ADDRESS、PRIVATE_KEY 都已设置
3. 重启后端服务
```

### 问题 2: "Insufficient Gas"

```
原因: 后端钱包没有足够的 Sepolia ETH
解决:
1. 从 Sepolia Faucet 获取更多测试币
2. 检查后端钱包地址: 
   const wallet = ethers.Wallet.fromPrivateKey(PRIVATE_KEY);
   console.log(wallet.address);
3. 发送测试币到该地址
```

### 问题 3: "Invalid wallet address"

```
原因: 用户输入的钱包地址格式不正确
解决:
1. 检查地址是否以 0x 开头
2. 检查地址长度是否为 42 个字符
3. 使用 ethers.isAddress() 验证
```

### 问题 4: "Transaction failed - Nonce too high"

```
原因: 交易 nonce 序列错误，通常是多个并发请求
解决:
1. 确保一次只发送一个交易
2. 等待上一个交易确认后再发送下一个
3. 重启后端重置 nonce
```

### 问题 5: MetaMask 不显示代币

```
原因: 需要手动添加代币到 MetaMask
解决:
1. 打开 MetaMask
2. 点击 "导入代币"
3. 输入合约地址: 0x5FbDB...
4. 代币符号应自动填充为 "KT"
5. 点击 "添加"
```

---

## 📱 集成到前端

### 使用 ethers.js

```javascript
import { ethers } from "ethers";

// 连接到用户的 MetaMask
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const userAddress = await signer.getAddress();

// 获取代币余额
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

const balance = await contract.balanceOf(userAddress);
console.log("代币余额:", ethers.formatUnits(balance, 18));
```

---

## 📚 参考资源

- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/
- **Ethers.js 文档**: https://docs.ethers.org/v6/
- **Hardhat 文档**: https://hardhat.org/docs
- **Sepolia Testnet**: https://sepolia.etherscan.io/
- **Ethereum 开发文档**: https://ethereum.org/en/developers/

