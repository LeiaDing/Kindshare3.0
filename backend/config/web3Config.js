import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: "backend/config/config.env" });

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// 简化的ERC20 ABI (只包含必要的函数)
const CONTRACT_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function mint(address to, uint256 amount) public",
  "function burn(uint256 amount) public"
];

let provider;
let wallet;
let contract;

try {
  if (SEPOLIA_RPC_URL && CONTRACT_ADDRESS && PRIVATE_KEY) {
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  }
} catch (error) {
  console.error("Web3 Configuration Error:", error.message);
}

export const getContract = () => {
  if (!contract) {
    throw new Error("Web3 contract not initialized. Check your environment variables.");
  }
  return contract;
};

export const getProvider = () => {
  if (!provider) {
    throw new Error("Web3 provider not initialized. Check SEPOLIA_RPC_URL in environment variables.");
  }
  return provider;
};

export const getWallet = () => {
  if (!wallet) {
    throw new Error("Web3 wallet not initialized. Check PRIVATE_KEY in environment variables.");
  }
  return wallet;
};

export const isWeb3Configured = () => {
  return !!(SEPOLIA_RPC_URL && CONTRACT_ADDRESS && PRIVATE_KEY);
};
