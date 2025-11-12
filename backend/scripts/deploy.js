const hre = require("hardhat");

async function main() {
  console.log("开始部署 KindToken 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log(`使用账户: ${deployer.address}`);

  // 获取账户余额
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`账户余额: ${ethers.formatEther(balance)} ETH`);

  // 部署合约
  const KindToken = await ethers.getContractFactory("KindToken");
  const kindToken = await KindToken.deploy();

  // 等待合约部署完成
  await kindToken.waitForDeployment();
  const address = await kindToken.getAddress();

  console.log(`✅ KindToken 已部署到: ${address}`);

  // 获取合约信息
  const name = await kindToken.name();
  const symbol = await kindToken.symbol();
  const totalSupply = await kindToken.totalSupply();

  console.log(`合约名称: ${name}`);
  console.log(`合约符号: ${symbol}`);
  console.log(`总供应量: ${ethers.formatUnits(totalSupply, 18)} ${symbol}`);

  // 保存合约地址到env文件
  const fs = require("fs");
  const envPath = "backend/config/config.env";
  let envContent = fs.readFileSync(envPath, "utf8");

  // 更新或添加合约地址
  if (envContent.includes("CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${address}`);
  } else {
    envContent += `\nCONTRACT_ADDRESS=${address}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`\n✅ 合约地址已保存到 config.env`);

  // 输出合约ABI
  const contractAbi = JSON.stringify(KindToken.interface.fragments, null, 2);
  console.log(`\n合约 ABI (保存到config.env的CONTRACT_ABI):`);
  console.log(contractAbi.substring(0, 200) + "...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
