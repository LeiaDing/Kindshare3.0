const { ethers } = require('ethers');
require('dotenv').config({ path: './backend/config/config.env' });

async function verifyContract() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  console.log('检查合约地址:', contractAddress);
  console.log('Sepolia RPC:', process.env.SEPOLIA_RPC_URL);
  
  try {
    // 检查地址上是否有代码
    const code = await provider.getCode(contractAddress);
    console.log('\n合约代码长度:', code.length);
    
    if (code === '0x') {
      console.log('❌ 该地址上没有部署任何合约！');
      console.log('需要重新部署合约。');
    } else {
      console.log('✅ 合约已部署');
      console.log('代码片段:', code.substring(0, 100) + '...');
      
      // 尝试读取合约信息
      const contractABI = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function totalSupply() view returns (uint256)"
      ];
      
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      try {
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        
        console.log('\n合约信息:');
        console.log('名称:', name);
        console.log('符号:', symbol);
        console.log('总供应量:', ethers.utils.formatUnits(totalSupply, 18), 'KSTT');
      } catch (err) {
        console.log('\n⚠️ 无法读取合约信息:', err.message);
      }
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
  
  process.exit(0);
}

verifyContract();
