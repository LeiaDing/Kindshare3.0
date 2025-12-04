const { ethers } = require("ethers");
require("dotenv").config({ path: "backend/config/config.env" });

async function checkBalance() {
  console.log("正在连接到 Sepolia...\n");
  
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  const contractABI = [
    "function balanceOf(address account) public view returns (uint256)",
    "function name() public view returns (string)",
    "function symbol() public view returns (string)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  // 查询合约信息
  const name = await contract.name();
  const symbol = await contract.symbol();
  console.log(`代币名称: ${name}`);
  console.log(`代币符号: ${symbol}`);
  console.log(`合约地址: ${contractAddress}\n`);
  
  // 查询两个账户的余额
  const user1 = "0x32e23d786a0b0107dd578133ea2d783aed275acd";
  const user2 = "0xe4d90bbe7155813364085c2489eeb16e07c30f22";
  
  const balance1 = await contract.balanceOf(user1);
  const balance2 = await contract.balanceOf(user2);
  
  console.log(`Account 1 (${user1}):`);
  console.log(`  余额: ${ethers.utils.formatUnits(balance1, 18)} ${symbol}\n`);
  
  console.log(`Account 2 (${user2}):`);
  console.log(`  余额: ${ethers.utils.formatUnits(balance2, 18)} ${symbol}\n`);
  
  if (balance1.toString() === "0" && balance2.toString() === "0") {
    console.log("⚠️ 两个账户余额都是 0，需要运行铸币脚本！");
  } else {
    console.log("✅ 代币余额查询成功！");
  }
}

checkBalance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 查询失败:", error.message);
    process.exit(1);
  });
