import express from "express";
import { 
  connectWallet, 
  getWalletBalance, 
  mintTokens,
  getUserWallet,
  transferTokensByUser,
  getTransaction
} from "../controllers/web3Controllers.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// 连接钱包
router.post("/wallet/connect", isAuthenticatedUser, connectWallet);

// 获取钱包余额 (公开)
router.get("/wallet/balance/:address", getWalletBalance);

// 获取当前用户钱包信息
router.get("/me/wallet", isAuthenticatedUser, getUserWallet);

// 铸造代币 (仅管理员)
router.post("/tokens/mint", isAuthenticatedUser, authorizeRoles("admin"), mintTokens);

// 用户转账代币
router.post("/tokens/transfer", isAuthenticatedUser, transferTokensByUser);

// 获取交易信息
router.get("/transaction/:txHash", getTransaction);

export default router;
