const { ethers } = require("ethers");
require("dotenv").config({ path: "backend/config/config.env" });

async function mintForAccount1() {
  console.log("正在连接到 Sepolia 测试网...\n");
  
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contractABI = [
    "function mint(address to, uint256 amount) public",
    "function balanceOf(address account) public view returns (uint256)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
  const user1 = "0x32e23d786a0b0107dd578133ea2d783aed275acd";
  const amount = ethers.utils.parseUnits("100", 18);
  
  console.log("正在为 Account 1 铸造 100 KSTT...");
  const tx = await contract.mint(user1, amount);
  console.log("交易已发送，等待确认...");
  await tx.wait();
  console.log(`✅ 已给 ${user1} 铸造 100 KSTT\n`);
  
  const balance = await contract.balanceOf(user1);
  console.log(`Account 1 最新余额: ${ethers.utils.formatUnits(balance, 18)} KSTT`);
}

mintForAccount1()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 铸币失败:", error.message);
    process.exit(1);
  });
