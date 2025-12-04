const { ethers } = require("ethers");
require("dotenv").config({ path: "backend/config/config.env" });

async function mintTokens() {
  console.log("正在连接到 Sepolia 测试网...\n");
  
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("钱包地址:", wallet.address);
  
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contractABI = [
    "function mint(address to, uint256 amount) public",
    "function balanceOf(address account) public view returns (uint256)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
  // 给两个用户各铸造 100 个代币
  const user1 = "0x32e23d786a0b0107dd578133ea2d783aed275acd";
  const user2 = "0xe4d90bbe7155813364085c2489eeb16e07c30f22";
  const amount = ethers.utils.parseUnits("100", 18);
  
  console.log("\n开始铸造代币...\n");
  
  console.log("正在为 Account 1 铸造...");
  const tx1 = await contract.mint(user1, amount);
  console.log("交易已发送，等待确认...");
  await tx1.wait();
  console.log(`✅ 已给 ${user1} 铸造 100 KSTT\n`);
  
  console.log("正在为 Account 2 铸造...");
  const tx2 = await contract.mint(user2, amount);
  console.log("交易已发送，等待确认...");
  await tx2.wait();
  console.log(`✅ 已给 ${user2} 铸造 100 KSTT\n`);
  
  // 查询余额
  console.log("查询最新余额...\n");
  const balance1 = await contract.balanceOf(user1);
  const balance2 = await contract.balanceOf(user2);
  
  console.log(`Account 1 余额: ${ethers.utils.formatUnits(balance1, 18)} KSTT`);
  console.log(`Account 2 余额: ${ethers.utils.formatUnits(balance2, 18)} KSTT`);
  
  console.log("\n✅ 铸币完成！");
}

mintTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 铸币失败:", error.message);
    process.exit(1);
  });
