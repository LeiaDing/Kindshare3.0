const mongoose = require('mongoose');

// 替换成你实际的钱包地址
const ACCOUNT1 = "0x你的Account1地址"; // momo (管理员)
const ACCOUNT2 = "0x你的Account2地址"; // jerry (普通用户)

mongoose.connect('mongodb://127.0.0.1:27017/shopit-v2')
  .then(async () => {
    console.log('已连接到数据库\n');
    
    // 更新第一个用户为管理员
    await mongoose.connection.db.collection('users').updateOne(
      { email: "dlimbic@163.com" },
      { $set: { walletAddress: ACCOUNT1, role: "admin" } }
    );
    console.log('✅ 已更新 momo 为管理员，钱包地址: ' + ACCOUNT1);
    
    // 更新第二个用户
    await mongoose.connection.db.collection('users').updateOne(
      { email: "leiasxufe@gmail.com" },
      { $set: { walletAddress: ACCOUNT2 } }
    );
    console.log('✅ 已更新 jerry 的钱包地址: ' + ACCOUNT2);
    
    // 验证
    const users = await mongoose.connection.db.collection('users')
      .find({}, { projection: { name: 1, email: 1, role: 1, walletAddress: 1 } })
      .toArray();
    
    console.log('\n当前用户列表:');
    users.forEach(u => {
      console.log(`\n- ${u.name} (${u.email})`);
      console.log(`  角色: ${u.role || 'user'}`);
      console.log(`  钱包: ${u.walletAddress || '未设置'}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('错误:', err);
    process.exit(1);
  });
