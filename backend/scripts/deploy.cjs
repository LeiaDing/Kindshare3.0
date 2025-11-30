const hre = require("hardhat");

async function main() {
  console.log("开始部署 KindToken 合约...");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log(`使用账户: ${deployer.address}`);

  // 获取账户余额
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`账户余额: ${hre.ethers.utils.formatEther(balance)} ETH`);

  // 部署合约
  const KindToken = await hre.ethers.getContractFactory("KindToken");
  console.log("正在部署合约...");
  
  const kindToken = await KindToken.deploy();
  console.log("等待部署确认...");
  
  await kindToken.deployed();
  
  console.log(`✅ KindToken 已部署到: ${kindToken.address}`);

  // 获取合约信息
  const name = await kindToken.name();
  const symbol = await kindToken.symbol();
  const totalSupply = await kindToken.totalSupply();

  console.log(`合约名称: ${name}`);
  console.log(`合约符号: ${symbol}`);
  console.log(`总供应量: ${hre.ethers.utils.formatUnits(totalSupply, 18)} ${symbol}`);

  // 保存合约地址到env文件
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(__dirname, "../../backend/config/config.env");
  
  let envContent = "";
  try {
    envContent = fs.readFileSync(envPath, "utf8");
  } catch (error) {
    console.log("config.env 文件不存在，将创建新文件");
  }

  // 更新或添加合约地址
  if (envContent.includes("CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${kindToken.address}`);
  } else {
    envContent += `\nCONTRACT_ADDRESS=${kindToken.address}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`\n✅ 合约地址已保存到 config.env`);
  console.log(`\n请将以下地址添加到前端配置:`);
  console.log(`CONTRACT_ADDRESS=${kindToken.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
