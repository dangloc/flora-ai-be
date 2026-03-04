# Hướng Dẫn Migration Schema MongoDB

## MongoDB Schema Update

MongoDB là **schema-less database**, nghĩa là:
- ✅ Không cần migration như SQL databases
- ✅ Schema mới tự động áp dụng khi tạo document mới
- ⚠️ Document cũ vẫn giữ nguyên cấu trúc cũ cho đến khi được cập nhật

## Các Trường Hợp Cần Migration

### 1. Field mới là `required: true`
Nếu field mới là bắt buộc, các document cũ sẽ thiếu field này và có thể gây lỗi khi query.

**Giải pháp:** Chạy migration script để cập nhật document cũ.

### 2. Field mới có `default` value
Mongoose sẽ tự động thêm default value khi tạo document mới, nhưng document cũ vẫn thiếu.

**Giải pháp:** Migration script để set default value cho document cũ.

## Cách Chạy Migration

### Migration Inventory Field

Để cập nhật field `inventory` cho tất cả sản phẩm cũ:

```bash
npm run migrate:inventory
```

Hoặc chạy trực tiếp:

```bash
node scripts/migrate-inventory.js
```

Script này sẽ:
1. Tìm tất cả sản phẩm không có field `inventory`
2. Cập nhật với giá trị mặc định `inventory: 0`
3. Hiển thị số lượng sản phẩm đã cập nhật

## Tạo Migration Script Mới

Nếu cần migration cho field khác, tạo file mới trong thư mục `scripts/`:

```javascript
// scripts/migrate-[field-name].js
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Model = require('../models/[modelName]');

const URI = process.env.MONGODB_URL;

async function migrate() {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Logic migration ở đây
    const result = await Model.updateMany(
      { fieldName: { $exists: false } },
      { $set: { fieldName: defaultValue } }
    );
    
    console.log(`Updated ${result.modifiedCount} documents`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrate();
```

## Lưu Ý Quan Trọng

1. **Backup Database:** Luôn backup database trước khi chạy migration
2. **Test trên Development:** Test migration trên database dev trước
3. **Kiểm tra kết quả:** Sau khi migration, kiểm tra lại data
4. **Field Required:** Nếu field là `required: true`, đảm bảo tất cả document đã có field đó

## Các Field Đã Thêm Gần Đây

- ✅ `inventory` trong `Products` model (required, default: 0)
- ✅ `brand` trong `Products` model (required)
- ✅ `variants` trong `Products` model (optional array)
- ✅ `images` trong `Category` model (optional)

## Kiểm Tra Schema

Để kiểm tra document có field hay không:

```javascript
// Trong MongoDB shell hoặc script
db.products.find({ inventory: { $exists: false } })
db.products.find({ brand: { $exists: false } })
```

## Tự Động Migration

Nếu muốn tự động migration khi server start, có thể thêm vào `server.js`:

```javascript
// Sau khi connect database
async function autoMigrate() {
  const productsWithoutInventory = await Products.countDocuments({
    inventory: { $exists: false }
  });
  
  if (productsWithoutInventory > 0) {
    await Products.updateMany(
      { inventory: { $exists: false } },
      { $set: { inventory: 0 } }
    );
    console.log(`Auto-migrated ${productsWithoutInventory} products`);
  }
}
```

