const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/shopit-v2')
  .then(async () => {
    console.log('已连接到数据库\n');
    
    // 查询所有商品
    const products = await mongoose.connection.db.collection('products')
      .find({}, { projection: { name: 1, seller: 1, sellerWallet: 1, user: 1 } })
      .toArray();
    
    console.log(`共找到 ${products.length} 个商品\n`);
    
    products.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   seller: ${p.seller}`);
      console.log(`   sellerWallet: ${p.sellerWallet || '❌ 未设置'}`);
      console.log(`   user (卖家用户ID): ${p.user || '未设置'}\n`);
    });
    
    // 检查有多少商品没有 sellerWallet
    const noWallet = products.filter(p => !p.sellerWallet);
    if (noWallet.length > 0) {
      console.log(`⚠️ 有 ${noWallet.length} 个商品没有设置 sellerWallet`);
      console.log('需要运行 updateProducts.cjs 来设置');
    } else {
      console.log('✅ 所有商品都已设置 sellerWallet');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('错误:', err);
    process.exit(1);
  });
