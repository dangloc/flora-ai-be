const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Products = require('../models/productModel');

// Kết nối database
const URI = process.env.MONGODB_URL;

async function migrateInventory() {
  try {
    console.log('Đang kết nối đến MongoDB...');
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Đã kết nối thành công!');

    // Tìm tất cả sản phẩm không có field inventory
    const productsWithoutInventory = await Products.find({
      $or: [
        { inventory: { $exists: false } },
        { inventory: null }
      ]
    });

    console.log(`Tìm thấy ${productsWithoutInventory.length} sản phẩm cần cập nhật`);

    if (productsWithoutInventory.length === 0) {
      console.log('Không có sản phẩm nào cần cập nhật!');
      await mongoose.connection.close();
      return;
    }

    // Cập nhật tất cả sản phẩm thiếu inventory với giá trị mặc định 0
    const result = await Products.updateMany(
      {
        $or: [
          { inventory: { $exists: false } },
          { inventory: null }
        ]
      },
      {
        $set: { inventory: 0 }
      }
    );

    console.log(`✅ Đã cập nhật ${result.modifiedCount} sản phẩm với inventory = 0`);

    // Kiểm tra lại
    const remaining = await Products.find({
      $or: [
        { inventory: { $exists: false } },
        { inventory: null }
      ]
    }).countDocuments();

    if (remaining === 0) {
      console.log('✅ Migration hoàn tất! Tất cả sản phẩm đã có field inventory.');
    } else {
      console.log(`⚠️  Còn ${remaining} sản phẩm chưa được cập nhật.`);
    }

    await mongoose.connection.close();
    console.log('Đã đóng kết nối database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi migration:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Chạy migration
migrateInventory();

