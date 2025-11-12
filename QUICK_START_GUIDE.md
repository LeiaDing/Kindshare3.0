# 🚀 Kindshare Web3 实现 - 快速启动指南

## 📌 准备工作

### 1. 安装必要工具
- Node.js 16+ (已安装)
- MongoDB (已安装)
- MetaMask 浏览器扩展

### 2. 获取API密钥

#### 2.1 Infura (RPC提供商)
1. 访问 https://infura.io
2. 注册账号
3. 创建新的项目，选择Ethereum
4. 复制Sepolia RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

#### 2.2 Etherscan (区块浏览器)
1. 访问 https://etherscan.io
2. 注册账号
3. 获取API Key

#### 2.3 MetaMask 钱包
1. 在浏览器安装MetaMask扩展
2. 创建或导入钱包
3. 复制你的钱包地址 (0x...)
4. 导出私钥 (Settings → Account Details → Export Private Key)
   ⚠️ **警告**: 私钥不要分享给任何人!

### 3. 获取测试ETH
1. 访问 https://sepoliafaucet.com
2. 输入你的钱包地址
3. 点击获取测试ETH (每个水龙头可能有限额)

---

## ⚙️ 安装依赖

### 后端依赖
```powershell
cd c:\Users\Admin\Kindshare4.0
npm install web3 ethers
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/hardhat-upgrades
npx hardhat
# 选择 "Create a basic sample project"
```

### 前端依赖
```powershell
cd frontend
npm install web3 ethers redux-persist
```

---

## 🔧 环境配置

### 修改 `backend/config/config.env`

```plaintext
# 添加以下Web3配置
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0xyour_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here
```

### 重要: 钱包配置步骤

1. **导出MetaMask私钥**
   - 打开MetaMask
   - 点击右上角菜单 → 账户详情
   - 点击"导出私钥"
   - 输入密码
   - 复制私钥 (0x开头)

2. **更新config.env**
   ```plaintext
   PRIVATE_KEY=0xyour_exported_private_key
   ```

---

## 📋 部署流程

### 第1步: 编译智能合约
```powershell
cd c:\Users\Admin\Kindshare4.0
npx hardhat compile
```

✅ 如果看到 "compiled successfully" 表示成功

### 第2步: 部署合约到Sepolia测试网
```powershell
npx hardhat run backend\scripts\deploy.js --network sepolia
```

✅ 输出示例:
```
✅ KindToken 已部署到: 0x1234567890123456789012345678901234567890
合约名称: Kind Share Token
合约符号: KSTT
总供应量: 10000000 KSTT
✅ 合约地址已保存到 config.env
```

### 第3步: 启动应用

#### 终端1: 启动MongoDB
```powershell
# 如果MongoDB作为服务运行，跳过此步
# 否则运行:
mongod
```

#### 终端2: 启动后端
```powershell
cd c:\Users\Admin\Kindshare4.0
npm run dev
```

✅ 输出: `Server started on PORT: 4000 in DEVELOPMENT mode.`

#### 终端3: 启动前端
```powershell
cd frontend
npm start
```

✅ 浏览器自动打开 http://localhost:3000

---

## 🧪 完整测试流程

### 测试场景: 两个用户交易

#### 🔴 准备: 创建两个MetaMask账号

1. **账号A (卖家/管理员)**
   - 打开MetaMask
   - 创建新账号或导入钱包A
   - 复制地址: 0xAAA...

2. **账号B (买家)**
   - 创建新账号或导入钱包B
   - 复制地址: 0xBBB...

3. 确保两个账号都在Sepolia网络上

---

#### 🟢 Step 1: 账号A注册并获得初始代币

1. 打开 http://localhost:3000
2. 点击"注册"
3. 填写信息:
   - 名称: Admin User
   - 邮箱: admin@example.com
   - 密码: Test@123
4. 点击"连接钱包" → MetaMask弹出 → 选择账号A
5. 授权连接
6. 点击"注册"
7. ✅ 验证: 账号A的MetaMask中显示 100 KSTT

---

#### 🟢 Step 2: 账号A发布商品

1. 登录后，点击"发布商品"
2. 填写商品信息:
   - 商品名称: 测试物品
   - 描述: 这是第一个共享物品
   - 价格: 50 (代币)
   - 类别: Electronics
   - 库存: 10
3. 点击"发布"
4. ✅ 验证: 商品已发布

---

#### 🟢 Step 3: 账号A查看发布的商品

1. 点击"我的商品"
2. ✅ 验证: 看到刚发布的"测试物品"

---

#### 🟢 Step 4: 账号B注册和购买

1. **新浏览器标签页** (保持账号A登录)
2. 打开 http://localhost:3000
3. 点击"注册"
4. 填写信息:
   - 名称: Normal User
   - 邮箱: user@example.com
   - 密码: Test@123
5. 连接钱包 → 选择账号B
6. 注册完成
7. ✅ 验证: 账号B的MetaMask中显示 100 KSTT

---

#### 🟢 Step 5: 账号B购买商品

1. 首页搜索"测试物品"
2. 点击商品
3. 点击"购买"
4. 输入数量: 1
5. 选择支付方式: 虚拟代币(KSTT)
6. 点击"确认购买"
7. MetaMask弹出交易确认
8. 点击"确认"
9. ✅ 等待交易完成 (约15秒)

---

#### ✅ 验证交易结果

**账号A (卖家) 应该看到:**
- MetaMask余额从 100 KSTT → 150 KSTT (+50代币)
- 订单历史中有收款记录
- 我的商品中库存从 10 → 9

**账号B (买家) 应该看到:**
- MetaMask余额从 100 KSTT → 50 KSTT (-50代币)
- 订单历史中有购买记录

---

## 🔍 查看交易详情

### API调用示例

#### 1. 获取用户钱包信息
```bash
curl -X GET http://localhost:4000/api/v1/me/wallet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

返回:
```json
{
  "success": true,
  "walletAddress": "0x...",
  "balance": "150"
}
```

#### 2. 获取我的订单
```bash
curl -X GET http://localhost:4000/api/v1/me/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
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
      "buyerWallet": "0xBBB...",
      "sellerWallet": "0xAAA...",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 3. 获取钱包余额
```bash
curl -X GET http://localhost:4000/api/v1/wallet/balance/0xAAA...
```

---

## 🐛 常见问题排查

### ❌ 问题: "Cannot find module 'ethers'"
```bash
解决方案:
npm install ethers web3 --save
```

### ❌ 问题: "SEPOLIA_RPC_URL is not defined"
```bash
解决方案:
1. 检查 backend/config/config.env 是否配置
2. 检查SEPOLIA_RPC_URL值是否正确
3. 重启后端服务
```

### ❌ 问题: "Invalid wallet address format"
```bash
解决方案:
1. 检查钱包地址是否以 0x 开头
2. 检查地址长度是否为 42 个字符
3. 复制完整地址，检查是否有空格
```

### ❌ 问题: MetaMask交易失败 - "Insufficient gas"
```bash
解决方案:
1. 确保钱包有足够的Sepolia ETH用于gas费
2. 访问 https://sepoliafaucet.com 获取更多测试ETH
```

### ❌ 问题: MetaMask 不显示Sepolia网络
```bash
解决方案:
1. 打开MetaMask
2. 点击网络选择器
3. 点击"添加网络"
4. 填写:
   - Network Name: Sepolia Testnet
   - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
   - Chain ID: 11155111
   - Currency Symbol: ETH
5. 点击"保存"
```

### ❌ 问题: 部署脚本错误 - "Contract not found"
```bash
解决方案:
1. 确保 KindToken.sol 在 backend/contracts/ 目录
2. 运行 npx hardhat compile
3. 检查Solidity版本与hardhat.config.js匹配
```

---

## 📊 交易流程图

```
┌─────────────────────────────────────────┐
│     用户A (卖家/管理员)                 │
│   1. 注册账户                          │
│   2. 连接MetaMask钱包                  │
│   3. 收到 100 KSTT                     │
│   4. 发布商品 (50 KSTT)                │
└─────────────────────────────────────────┘
                    ↓
              等待购买...
                    ↓
┌─────────────────────────────────────────┐
│     用户B (买家)                        │
│   1. 注册账户                          │
│   2. 连接MetaMask钱包                  │
│   3. 收到 100 KSTT                     │
│   4. 搜索商品                          │
│   5. 确认购买                          │
└─────────────────────────────────────────┘
                    ↓
          [智能合约交易执行]
                    ↓
      用户B: 100 KSTT → 50 KSTT
      用户A: 100 KSTT → 150 KSTT
                    ↓
          ✅ 交易完成！
```

---

## 📱 后续扩展功能

- [ ] 用户简介和信誉系统
- [ ] 商品评价和评分
- [ ] 代币市场交易对
- [ ] NFT商品认证
- [ ] DAO投票治理
- [ ] 多链支持 (Polygon, Arbitrum)
- [ ] 手机App集成

---

## 📞 技术支持

如遇问题，按以下顺序检查:

1. **后端日志**: 检查终端2的错误信息
2. **前端控制台**: F12打开浏览器控制台查看错误
3. **MetaMask日志**: MetaMask扩展设置 → Advanced → 查看日志
4. **MongoDB**: 检查是否正常运行

---

**最后更新**: 2024年11月
**状态**: ✅ 完成
