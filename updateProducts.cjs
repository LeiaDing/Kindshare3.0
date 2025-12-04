const mongoose = require('mongoose');

// 替换成你的管理员钱包地址（Account 1）
const ADMIN_WALLET = "0x你的Account1地址";

mongoose.connect('mongodb://127.0.0.1:27017/shopit-v2')
  .then(async () => {
    console.log('已连接到数据库\n');
    
    // 更新所有商品，添加 sellerWallet 字段
    const result = await mongoose.connection.db.collection('products').updateMany(
      {}, // 匹配所有商品
      { $set: { sellerWallet: ADMIN_WALLET } }
    );
    
    console.log(`✅ 已更新 ${result.modifiedCount} 个商品`);
    
    // 验证结果
    const products = await mongoose.connection.db.collection('products')
      .find({}, { projection: { name: 1, seller: 1, sellerWallet: 1 } })
      .toArray();
    
    console.log('\n商品列表:');
    products.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   卖家: ${p.seller}`);
      console.log(`   钱包地址: ${p.sellerWallet || '未设置'}\n`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('错误:', err);
    process.exit(1);
  });
