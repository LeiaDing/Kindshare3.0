# 🚀 Kindshare Web3 - 完整启动指南（从零到部署）

## 📌 前置检查

在开始前，运行项目检查脚本：

```powershell
# Windows PowerShell
.\check_setup.bat

# 或直接在PowerShell执行
cmd /c check_setup.bat
```

这个脚本会检查：
- ✅ 所有Web3文件是否存在
- ✅ 是否有冲突的重复目录
- ✅ Hardhat配置是否正确
- ✅ 环境变量是否已配置

---

## 🔧 Step 1: 安装依赖（5分钟）

### 1.1 后端依赖

```powershell
cd c:\Users\Admin\Kindshare4.0

# 安装所有后端依赖
npm install

# 安装Hardhat和相关工具（不要运行 npx hardhat init）
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify @openzeppelin/contracts

# 验证安装
npx hardhat --version
```

✅ **检查点**: 应该看到Hardhat版本号

### 1.2 前端依赖

```powershell
cd frontend
npm install

# 验证
npm ls web3 ethers
```

✅ **检查点**: 应该看到 web3 和 ethers 已安装

---

## ⚠️ Step 2: 清理可能的重复目录（重要！）

如果你已经运行过 `npx hardhat init`，会有重复目录：

### 方案A: 自动清理（推荐）

```powershell
# 返回根目录
cd c:\Users\Admin\Kindshare4.0

# 运行自动清理脚本
.\cleanup_hardhat.bat

# 脚本会:
# 1. 备份重复的目录到 backup_cleanup/
# 2. 删除根目录的 contracts/ 和 scripts/
# 3. 验证 backend/ 下的文件完整
```

### 方案B: 手动清理（如果自动脚本不工作）

```powershell
# 1. 检查是否存在重复
dir | findstr "contracts scripts"

# 2. 如果存在，备份然后删除
# （假设已备份重要文件）
if (Test-Path "contracts") { 
    Remove-Item -Recurse -Force contracts
    Write-Host "[OK] 已删除重复的 contracts/ 目录"
}

if (Test-Path "scripts") { 
    Remove-Item -Recurse -Force scripts
    Write-Host "[OK] 已删除重复的 scripts/ 目录"
}

# 3. 验证
dir backend\contracts
dir backend\scripts
```

✅ **检查点**: 应该只看到 backend 下的目录，根目录没有重复

---

## 🔑 Step 3: 配置Web3环境变量（10分钟）

### 3.1 获取Infura API密钥

1. 访问 **https://infura.io**
2. 注册新账号
3. 创建新Project，选择 "Ethereum"
4. 选择 Sepolia 网络
5. 复制 **Sepolia RPC URL**: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### 3.2 获取MetaMask私钥

1. 打开 **MetaMask** 浏览器扩展
2. 点击右上角菜单 → **Account Details**
3. 点击 **Export Private Key**
4. 输入钱包密码
5. 复制私钥（以 `0x` 开头）

⚠️ **安全提示**: 
- 永远不要在GitHub上提交私钥
- 只在本地测试网络使用
- 不要使用主网钱包的私钥

### 3.3 获取测试ETH

1. 访问 **https://sepoliafaucet.com**
2. 输入你的MetaMask地址
3. 点击获取测试ETH（可能需要等待5-30分钟）

💡 **提示**: 有多个Sepolia水龙头，如果一个不工作可以试试其他

### 3.4 更新环境变量

打开 `backend/config/config.env`：

```plaintext
# 现有配置保留...
PORT=4000
NODE_ENV=DEVELOPMENT
FRONTEND_URL=http://localhost:3000

# MongoDB
DB_LOCAL_URI=mongodb://127.0.0.1:27017/shopit-v2

# ============ 新增Web3配置 ============
# Infura Sepolia RPC URL (从上面复制)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# MetaMask私钥 (从上面复制)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Etherscan API Key (可选，用于合约验证)
ETHERSCAN_API_KEY=

# ============ 保留现有配置 ============
JWT_SECRET=SJF34390JFKDJFSDKLFJ4F0DSJFKSDJF3049RDFJSDKLFJSKJDFO34
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRES_TIME=7

# ... 其他配置
```

✅ **检查点**: `SEPOLIA_RPC_URL` 和 `PRIVATE_KEY` 已填入

---

## 🔗 Step 4: 编译智能合约（5分钟）

```powershell
cd c:\Users\Admin\Kindshare4.0

# 编译Solidity合约
npx hardhat compile
```

✅ **预期输出**:
```
Compiled 1 Solidity file successfully
```

✅ **检查点**: 应该在 `backend/artifacts/` 中看到编译文件

---

## 🚀 Step 5: 部署合约到Sepolia测试网（10分钟）

```powershell
# 确保在项目根目录
cd c:\Users\Admin\Kindshare4.0

# 部署合约
npx hardhat run backend\scripts\deploy.js --network sepolia

# 这可能需要30秒到1分钟
```

✅ **预期输出**:
```
开始部署 KindToken 合约...
使用账户: 0x...
账户余额: X.XXX ETH
✅ KindToken 已部署到: 0x1234567890123456789012345678901234567890
合约名称: Kind Share Token
合约符号: KSTT
总供应量: 10000000 KSTT

✅ 合约地址已保存到 config.env
```

✅ **检查点**: 
- 看到"已部署"消息
- `backend/config/config.env` 中自动添加了 `CONTRACT_ADDRESS=0x...`

---

## ⚡ Step 6: 启动应用（5分钟）

### 6.1 启动数据库

```powershell
# 如果MongoDB已作为服务运行，可跳过
# 否则打开一个新终端运行:
mongod

# 或确认MongoDB服务运行
Get-Service mongodb -ErrorAction SilentlyContinue | Select Status
```

### 6.2 启动后端（新终端）

```powershell
cd c:\Users\Admin\Kindshare4.0

npm run dev

# 预期输出:
# Server started on PORT: 4000 in DEVELOPMENT mode.
```

✅ **检查点**: 看到"Server started on PORT: 4000"

### 6.3 启动前端（新终端）

```powershell
cd frontend

npm start

# 浏览器自动打开 http://localhost:3000
```

✅ **检查点**: 浏览器打开到Kindshare首页

---

## 🧪 Step 7: 完整功能测试（30分钟）

### 7.1 用户A (卖家) - 账号A

**在主浏览器运行:**

1. **访问首页**
   ```
   http://localhost:3000
   ```

2. **注册账户A**
   - 点击 "注册"
   - 名称: `Admin User`
   - 邮箱: `admin@example.com`
   - 密码: `Test@12345`
   - 点击 "注册"

3. **连接MetaMask (账号A)**
   - 看到"连接钱包"按钮
   - 点击
   - MetaMask弹出
   - 选择 **账号A**
   - 点击 "下一步" → "连接"

4. **验证代币转账**
   - MetaMask中应该显示 **100 KSTT**
   - 如果没显示，点击MetaMask中的 "导入代币"
   - 合约地址: (从config.env复制)
   - 符号: KSTT
   - 精度: 18

5. **发布商品**
   - 点击 "发布商品"
   - 填写:
     - 名称: `测试物品 - 共享书籍`
     - 描述: `这是我第一次共享的书籍`
     - 价格: `50` KSTT
     - 类别: `Books`
     - 库存: `10`
   - 上传图片（可选）
   - 点击 "发布"

6. **查看我的商品**
   - 点击 "我的商品"
   - 应该看到 "测试物品 - 共享书籍"

---

### 7.2 用户B (买家) - 账号B

**在隐私窗口或另一个浏览器运行:**

1. **访问首页**
   ```
   http://localhost:3000
   ```

2. **注册账户B**
   - 点击 "注册"
   - 名称: `Normal User`
   - 邮箱: `user@example.com`
   - 密码: `Test@12345`

3. **连接MetaMask (账号B)**
   - 点击 "连接钱包"
   - MetaMask弹出
   - **切换到账号B** (如果还没有切换)
   - 选择账号B
   - 授权连接

4. **验证代币**
   - 应该收到 100 KSTT

---

### 7.3 购买交易

**在用户B浏览器:**

1. **搜索商品**
   - 在首页搜索框输入 "测试物品"
   - 点击搜索

2. **查看商品详情**
   - 点击 "测试物品 - 共享书籍"
   - 看到价格 50 KSTT
   - 看到卖家信息 (Admin User)

3. **确认购买**
   - 输入数量: `1`
   - 点击 "购买"
   - 选择支付方式: `虚拟代币`

4. **MetaMask确认**
   - MetaMask弹出交易确认窗口
   - 检查金额: 50 KSTT
   - 点击 "确认"
   - 等待交易完成（约15秒）

---

### 7.4 验证交易结果

**账号A (卖家) 应该看到:**

返回账号A浏览器：

```
✅ MetaMask余额变化:
   100 KSTT → 150 KSTT (+ 50 KSTT)

✅ 订单历史:
   • 发现新订单，收到50 KSTT

✅ 商品库存:
   • 库存从 10 → 9
```

**账号B (买家) 应该看到:**

```
✅ MetaMask余额变化:
   100 KSTT → 50 KSTT (- 50 KSTT)

✅ 订单历史:
   • 看到已支付的订单

✅ 订单详情:
   • 商品: 测试物品 - 共享书籍
   • 价格: 50 KSTT
   • 状态: Processing
```

---

## 🔍 调试与检查

### 查看API返回

```powershell
# 在另一个终端运行 (获取JWT token后)

# 获取钱包信息
Invoke-WebRequest -Uri "http://localhost:4000/api/v1/me/wallet" `
  -Headers @{Authorization = "Bearer YOUR_JWT_TOKEN"}

# 查看所有订单
Invoke-WebRequest -Uri "http://localhost:4000/api/v1/me/orders" `
  -Headers @{Authorization = "Bearer YOUR_JWT_TOKEN"} | Select -ExpandProperty Content | ConvertFrom-Json
```

### 查看交易详情

访问 **Sepolia 区块浏览器**:
```
https://sepolia.etherscan.io/tx/0x...
```

在地址栏输入你的交易哈希查看完整的区块链记录。

---

## 📊 完整流程检查清单

- [ ] Infura API密钥已获取
- [ ] MetaMask钱包已创建/导入
- [ ] 测试ETH已获取
- [ ] `backend/config/config.env` 已配置
- [ ] `npm install` 已运行（根目录）
- [ ] `npm install` 已运行（frontend目录）
- [ ] Hardhat依赖已安装
- [ ] 没有重复的 `/contracts` 或 `/scripts` 目录
- [ ] `npx hardhat compile` 成功
- [ ] `npx hardhat run backend\scripts\deploy.js --network sepolia` 成功
- [ ] MongoDB已启动
- [ ] 后端已启动 (`npm run dev`)
- [ ] 前端已启动 (`npm start`)
- [ ] 账号A已注册并连接MetaMask
- [ ] 账号A已发布商品
- [ ] 账号B已注册并连接MetaMask
- [ ] 账号B已成功购买商品
- [ ] 代币余额已正确变化

---

## ❌ 常见错误及解决方案

### 错误1: "Cannot find module 'ethers'"

```bash
解决: npm install ethers web3
```

### 错误2: "SEPOLIA_RPC_URL is not defined"

```bash
检查:
1. backend/config/config.env 是否包含 SEPOLIA_RPC_URL
2. 值是否正确 (https://sepolia.infura.io/v3/...)
3. 重启后端: npm run dev
```

### 错误3: "Contract not compiled"

```bash
解决:
npx hardhat compile
```

### 错误4: "Insufficient gas"

```bash
检查:
1. 钱包是否有足够的Sepolia ETH (> 0.01 ETH)
2. 访问 https://sepoliafaucet.com 获取更多
```

### 错误5: MetaMask 连接失败

```bash
检查:
1. Sepolia 网络是否添加到 MetaMask
2. 是否切换到 Sepolia 网络
3. 钱包地址是否正确
```

---

## 🎉 成功标志

当你看到以下情况时，说明Web3集成成功了：

✅ 两个用户账户都收到了初始100个KSTT代币
✅ 用户A可以发布商品
✅ 用户B可以搜索和购买商品
✅ 购买时MetaMask弹出交易确认
✅ 交易完成后代币余额正确变化
✅ 可以在Etherscan上看到交易记录

---

**文档最后更新**: 2024年11月11日
**状态**: ✅ 完整可用
