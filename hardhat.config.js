require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config({ path: "backend/config/config.env" });

/**
 * Hardhat Configuration File
 * 项目Web3配置 - Kindshare 4.0
 * 
 * 路径说明:
 * ✅ 合约文件: backend/contracts/
 * ✅ 部署脚本: backend/scripts/
 * ✅ 测试文件: backend/test/
 * ✅ 编译输出: backend/artifacts/
 * ✅ 缓存: backend/cache/
 */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  // 自定义路径 - 所有Web3文件都在backend目录下
  paths: {
    sources: "./backend/contracts",
    tests: "./backend/test",
    cache: "./backend/cache",
    artifacts: "./backend/artifacts",
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
  },
  mocha: {
    timeout: 40000,
  },
};
