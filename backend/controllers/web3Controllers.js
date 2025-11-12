import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import { 
  transferTokens, 
  getTokenBalance, 
  mintTokensForNewUser,
  isValidEthereumAddress,
  getTransactionInfo
} from "../utils/web3Service.js";
import ErrorHandler from "../utils/errorHandler.js";

// 连接钱包
export const connectWallet = catchAsyncErrors(async (req, res, next) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return next(new ErrorHandler("Wallet address is required", 400));
  }

  // 验证钱包地址格式
  if (!isValidEthereumAddress(walletAddress)) {
    return next(new ErrorHandler("Invalid wallet address format", 400));
  }

  // 检查钱包是否已被其他用户使用
  const existingUser = await User.findOne({ walletAddress });
  if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("This wallet is already connected to another account", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { walletAddress },
    { new: true }
  );

  // 为用户铸造初始代币
  const mintResult = await mintTokensForNewUser(walletAddress, 100);

  if (!mintResult.success) {
    console.warn("Warning: Token minting failed, but wallet connected:", mintResult.error);
  }

  res.status(200).json({
    success: true,
    user,
    message: "Wallet connected successfully"
  });
});

// 获取钱包余额
export const getWalletBalance = catchAsyncErrors(async (req, res, next) => {
  const { address } = req.params;

  if (!isValidEthereumAddress(address)) {
    return next(new ErrorHandler("Invalid wallet address", 400));
  }

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

  if (!isValidEthereumAddress(userWallet)) {
    return next(new ErrorHandler("Invalid wallet address", 400));
  }

  if (!amount || amount <= 0) {
    return next(new ErrorHandler("Amount must be greater than 0", 400));
  }

  const result = await mintTokensForNewUser(userWallet, amount);

  if (!result.success) {
    return next(new ErrorHandler(result.error, 500));
  }

  res.status(200).json({
    success: true,
    transactionHash: result.transactionHash,
    message: `Successfully minted ${amount} tokens`
  });
});

// 获取用户钱包信息
export const getUserWallet = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('walletAddress');

  if (!user.walletAddress) {
    return next(new ErrorHandler("Wallet not connected", 404));
  }

  const balance = await getTokenBalance(user.walletAddress);

  res.status(200).json({
    success: true,
    walletAddress: user.walletAddress,
    balance
  });
});

// 转账代币 (用户之间)
export const transferTokensByUser = catchAsyncErrors(async (req, res, next) => {
  const { toAddress, amount } = req.body;

  const user = await User.findById(req.user._id);

  if (!user.walletAddress) {
    return next(new ErrorHandler("User wallet not connected", 400));
  }

  if (!isValidEthereumAddress(toAddress)) {
    return next(new ErrorHandler("Invalid recipient wallet address", 400));
  }

  if (!amount || amount <= 0) {
    return next(new ErrorHandler("Amount must be greater than 0", 400));
  }

  // 检查余额 (简单检查，实际应该用智能合约验证)
  const balance = await getTokenBalance(user.walletAddress);
  if (parseFloat(balance) < amount) {
    return next(new ErrorHandler("Insufficient token balance", 400));
  }

  const result = await transferTokens(toAddress, amount);

  if (!result.success) {
    return next(new ErrorHandler(result.error, 500));
  }

  res.status(200).json({
    success: true,
    transactionHash: result.transactionHash,
    message: `Successfully transferred ${amount} tokens`
  });
});

// 获取交易详情
export const getTransaction = catchAsyncErrors(async (req, res, next) => {
  const { txHash } = req.params;

  const txInfo = await getTransactionInfo(txHash);

  if (!txInfo) {
    return next(new ErrorHandler("Transaction not found", 404));
  }

  res.status(200).json({
    success: true,
    transaction: txInfo
  });
});
