import { ethers } from "ethers";
import { getContract, getProvider } from "../config/web3Config.js";
import User from "../models/user.js";

// 转账代币
export const transferTokens = async (toAddress, amount) => {
  try {
    const contract = getContract();
    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    
    console.log(`Transferring ${amount} tokens to ${toAddress}`);
    
    const tx = await contract.transfer(toAddress, amountInWei);
    const receipt = await tx.wait();
    
    console.log(`Transaction hash: ${receipt.hash}`);
    
    return {
      success: true,
      transactionHash: receipt.hash,
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
    const formattedBalance = ethers.formatUnits(balance, 18);
    return formattedBalance;
  } catch (error) {
    console.error("Balance query error:", error);
    return "0";
  }
};

// 新用户注册时铸造代币
export const mintTokensForNewUser = async (userWalletAddress, amount = 100) => {
  try {
    const contract = getContract();
    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    
    console.log(`Minting ${amount} tokens to ${userWalletAddress}`);
    
    const tx = await contract.mint(userWalletAddress, amountInWei);
    const receipt = await tx.wait();
    
    console.log(`Mint transaction hash: ${receipt.hash}`);
    
    return {
      success: true,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error("Mint error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 处理购买交易 (从买家转给卖家)
export const handlePurchaseTransaction = async (buyerWallet, sellerWallet, amount) => {
  try {
    const contract = getContract();
    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    
    console.log(`Purchase transaction: ${amount} from ${buyerWallet} to ${sellerWallet}`);
    
    // 使用transferFrom需要预先授权，这里简化使用转账
    // 实际应用中应该使用 transferFrom 或其他方式
    const tx = await contract.transfer(sellerWallet, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error("Purchase transaction error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 验证钱包地址格式
export const isValidEthereumAddress = (address) => {
  return ethers.isAddress(address);
};

// 获取交易信息
export const getTransactionInfo = async (txHash) => {
  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt;
  } catch (error) {
    console.error("Error getting transaction info:", error);
    return null;
  }
};
