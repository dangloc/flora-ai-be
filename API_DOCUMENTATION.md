# API Documentation - Backend APIs (Full Response)

**Base URL:** `http://localhost:5000`

---

## 📝 Table of Contents
1. [User APIs](#-user-apis)
2. [Product APIs](#-product-apis)
3. [Category APIs](#-category-apis)
4. [Banner APIs](#-banner-apis)
5. [Chat AI APIs](#-chat-ai-apis)
6. [Admin Chat APIs](#-admin-chat-apis)
7. [Payment APIs](#-payment-apis)
8. [Coupon APIs](#-coupon-apis)
9. [News APIs](#-news-apis)
10. [News Category APIs](#-news-category-apis)
11. [Contact APIs](#-contact-apis)
12. [Upload APIs](#-upload-apis)

---

## 🧑‍💼 User APIs

### 1. POST `/user/register` — Đăng ký
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"123456"}'
```
**Response 200:**
```json
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTFiMmMzZDRlNWY2Nzg5MGFiY2RlZiIsImlhdCI6MTcxNjAwMDAwMH0.xxxxx"
```
**Response 400:**
```json
{ "msg": "Email đã được đăng ký" }
```

---

### 2. POST `/user/login` — Đăng nhập
```bash
curl -X POST http://localhost:5000/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```
**Response 200:**
```json
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTFiMmMzZDRlNWY2Nzg5MGFiY2RlZiIsImlhdCI6MTcxNjAwMDAwMH0.xxxxx"
```
**Response 400:**
```json
{ "msg": "Người dùng không tồn tại." }
```
```json
{ "msg": "Sai mật khẩu." }
```

---

### 3. GET `/user/logout` — Đăng xuất
```bash
curl -X GET http://localhost:5000/user/logout
```
**Response 200:**
```json
{ "msg": "Đăng xuất" }
```

---

### 4. GET `/user/refresh_token` — Refresh Token
```bash
curl -X GET http://localhost:5000/user/refresh_token \
  --cookie "refreshtoken=YOUR_REFRESH_TOKEN"
```
**Response 200:**
```json
{ "accesstoken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
**Response 400:**
```json
{ "msg": "Hãy đăng nhập hoặc đăng ký" }
```

---

### 5. GET `/user/infor` — Lấy thông tin user [🔐 Auth]
```bash
curl -X GET http://localhost:5000/user/infor \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Response 200:**
```json
{
  "_id": "64a1b2c3d4e5f67890abcdef",
  "name": "John Doe",
  "email": "john@example.com",
  "role": 0,
  "cart": [],
  "likes": [],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### 6. PATCH `/user/addcart` — Cập nhật giỏ hàng [🔐 Auth]
```bash
curl -X PATCH http://localhost:5000/user/addcart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cart":[{"_id":"64a1b2c3d4e5f67890abcdef","quantity":2,"title":"Áo sơ mi","price":250000,"images":{"url":"https://example.com/img.jpg"}}]}'
```
**Response 200:**
```json
{ "msg": "Đã thêm sản phẩm" }
```

---

### 7. GET `/user/history` — Lịch sử mua hàng [🔐 Auth]
```bash
curl -X GET http://localhost:5000/user/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Response 200:**
```json
[
  {
    "_id": "64b2c3d4e5f67890abcdef01",
    "user_id": "64a1b2c3d4e5f67890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "paymentID": "cs_test_xxxxx",
    "address": "123 Nguyễn Huệ, Q1, HCM",
    "cart": [
      {
        "_id": "64a1b2c3d4e5f67890abc001",
        "title": "áo sơ mi",
        "price": 250000,
        "quantity": 2,
        "images": { "url": "https://res.cloudinary.com/xxx/image.jpg" }
      }
    ],
    "status": true,
    "paymentMethod": "stripe",
    "deliveryStatus": "pending",
    "discount": 0,
    "totalAmount": 500000,
    "createdAt": "2025-02-01T14:20:00.000Z"
  }
]
```

---

### 8. POST `/user/like` — Thích sản phẩm [🔐 Auth]
```bash
curl -X POST http://localhost:5000/user/like \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"64a1b2c3d4e5f67890abc001"}'
```
**Response 200:**
```json
{ "msg": "Đã thích sản phẩm" }
```
**Response 400:**
```json
{ "msg": "Sản phẩm đã được thích rồi" }
```

---

### 9. POST `/user/unlike` — Bỏ thích sản phẩm [🔐 Auth]
```bash
curl -X POST http://localhost:5000/user/unlike \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"64a1b2c3d4e5f67890abc001"}'
```
**Response 200:**
```json
{ "msg": "Đã bỏ thích sản phẩm" }
```

---

### 10. GET `/user/likes` — Danh sách sản phẩm đã thích [🔐 Auth]
```bash
curl -X GET http://localhost:5000/user/likes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 2,
  "likes": [
    {
      "_id": "64a1b2c3d4e5f67890abc001",
      "product_id": "SP001",
      "title": "áo sơ mi trắng",
      "price": 250000,
      "images": { "url": "https://res.cloudinary.com/xxx/image.jpg" },
      "category": "Áo",
      "brand": "Lamia"
    }
  ]
}
```

---

### 11. GET `/user/check-like/:productId` — Kiểm tra đã like chưa [🔐 Auth]
```bash
curl -X GET http://localhost:5000/user/check-like/64a1b2c3d4e5f67890abc001 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Response 200:**
```json
{ "isLiked": true }
```

---

### 12. GET `/user/all-users` — Lấy tất cả admin
```bash
curl -X GET http://localhost:5000/user/all-users
```
**Response 200:**
```json
[
  {
    "_id": "64a1b2c3d4e5f67890abcdef",
    "name": "Admin",
    "email": "admin@lamia.com",
    "role": 1,
    "cart": [],
    "likes": [],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### 13. GET `/user/admin-main` — Lấy admin chính
```bash
curl -X GET http://localhost:5000/user/admin-main
```
**Response 200:**
```json
{
  "status": "success",
  "admin": {
    "_id": "64a1b2c3d4e5f67890abcdef",
    "name": "Admin",
    "email": "admin@lamia.com"
  }
}
```

---

## 🛍️ Product APIs

### 1. GET `/api/products` — Lấy danh sách sản phẩm
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=9&sort=-createdAt&category=Áo&title[regex]=sơ mi"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 25,
  "products": [
    {
      "_id": "64a1b2c3d4e5f67890abc001",
      "product_id": "SP001",
      "title": "áo sơ mi trắng oxford",
      "price": 250000,
      "description": "Áo sơ mi trắng chất lượng cao",
      "content": "Chi tiết sản phẩm...",
      "images": { "public_id": "uploader/xxx", "url": "https://res.cloudinary.com/xxx/image.jpg" },
      "category": "Áo",
      "brand": "Lamia",
      "checked": false,
      "sold": 15,
      "likes": 8,
      "variants": [
        {
          "_id": "64a1b2c3d4e5f67890var001",
          "sku": "SP001-M-WHITE",
          "attributes": { "size": "M", "color": "Trắng" },
          "inventory": 50,
          "price": 250000
        }
      ],
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-02-15T12:00:00.000Z"
    }
  ]
}
```

---

### 2. POST `/api/products` — Tạo sản phẩm
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "SP002",
    "title": "Quần jean slim fit",
    "price": 450000,
    "description": "Quần jean đẹp",
    "content": "Chi tiết sản phẩm",
    "images": {"public_id":"uploader/abc","url":"https://res.cloudinary.com/xxx/img.jpg"},
    "category": "Quần",
    "brand": "Lamia",
    "variants": [
      {"sku":"SP002-M-BLACK","attributes":{"size":"M","color":"Đen"},"inventory":30}
    ]
  }'
```
**Response 200:**
```json
{ "msg": "Tạo thành công sản phẩm" }
```
**Response 400:**
```json
{ "msg": "Sản phẩm này đã tồn tại" }
```

---

### 3. GET `/api/products/best-selling` — Sản phẩm bán chạy
```bash
curl -X GET "http://localhost:5000/api/products/best-selling?limit=10&minSold=1"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 5,
  "products": [
    {
      "_id": "64a1b2c3d4e5f67890abc001",
      "product_id": "SP001",
      "title": "áo sơ mi trắng",
      "price": 250000,
      "sold": 120,
      "images": { "url": "https://res.cloudinary.com/xxx/image.jpg" },
      "category": "Áo",
      "brand": "Lamia"
    }
  ]
}
```

---

### 4. PUT `/api/products/:id` — Cập nhật sản phẩm
```bash
curl -X PUT http://localhost:5000/api/products/64a1b2c3d4e5f67890abc001 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Áo sơ mi trắng cao cấp",
    "price": 280000,
    "description": "Mô tả mới",
    "content": "Nội dung mới",
    "images": {"public_id":"uploader/abc","url":"https://res.cloudinary.com/xxx/img.jpg"},
    "category": "Áo",
    "brand": "Lamia"
  }'
```
**Response 200:**
```json
{ "msg": "Cập nhật sản phẩm thành công." }
```

---

### 5. DELETE `/api/products/:id` — Xóa sản phẩm
```bash
curl -X DELETE http://localhost:5000/api/products/64a1b2c3d4e5f67890abc001
```
**Response 200:**
```json
{ "msg": "Xóa thành công sản phẩm" }
```

---

### 6. GET `/api/products/:id/variants` — Lấy variants của sản phẩm
```bash
curl -X GET http://localhost:5000/api/products/64a1b2c3d4e5f67890abc001/variants
```
**Response 200:**
```json
{
  "status": "success",
  "variants": [
    {
      "_id": "64a1b2c3d4e5f67890var001",
      "sku": "SP001-M-WHITE",
      "attributes": { "size": "M", "color": "Trắng" },
      "inventory": 50,
      "price": 250000
    },
    {
      "_id": "64a1b2c3d4e5f67890var002",
      "sku": "SP001-L-BLACK",
      "attributes": { "size": "L", "color": "Đen" },
      "inventory": 30,
      "price": 270000
    }
  ]
}
```

---

### 7. POST `/api/products/:id/variants` — Thêm variant
```bash
curl -X POST http://localhost:5000/api/products/64a1b2c3d4e5f67890abc001/variants \
  -H "Content-Type: application/json" \
  -d '{"sku":"SP001-XL-RED","attributes":{"size":"XL","color":"Đỏ"},"inventory":20,"price":260000}'
```
**Response 200:**
```json
{ "msg": "Thêm biến thể thành công" }
```
**Response 400:**
```json
{ "msg": "SKU đã tồn tại trong sản phẩm này" }
```

---

### 8. PUT `/api/products/:id/variants/:variantId` — Cập nhật variant
```bash
curl -X PUT http://localhost:5000/api/products/64a1b2c3d4e5f67890abc001/variants/64a1b2c3d4e5f67890var001 \
  -H "Content-Type: application/json" \
  -d '{"sku":"SP001-M-BLUE","attributes":{"size":"M","color":"Xanh"},"inventory":40}'
```
**Response 200:**
```json
{ "msg": "Cập nhật biến thể thành công" }
```

---

### 9. DELETE `/api/products/:id/variants/:variantId` — Xóa variant
```bash
curl -X DELETE http://localhost:5000/api/products/64a1b2c3d4e5f67890abc001/variants/64a1b2c3d4e5f67890var001
```
**Response 200:**
```json
{ "msg": "Xóa biến thể thành công" }
```

---

### 10. PUT `/api/products/:id/variants/:variantId/inventory` — Cập nhật tồn kho variant
```bash
curl -X PUT http://localhost:5000/api/products/64a1b2c3d4e5f67890abc001/variants/64a1b2c3d4e5f67890var001/inventory \
  -H "Content-Type: application/json" \
  -d '{"inventory":100}'
```
**Response 200:**
```json
{
  "msg": "Cập nhật số lượng tồn kho thành công",
  "inventory": 100,
  "totalInventory": 250
}
```

---

## 📁 Category APIs

### 1. GET `/api/category` — Lấy tất cả danh mục
```bash
curl -X GET http://localhost:5000/api/category
```
**Response 200:**
```json
[
  {
    "_id": "64a1b2c3d4e5f67890cat001",
    "name": "Áo",
    "images": {
      "public_id": "categories/abc123",
      "url": "https://res.cloudinary.com/xxx/category.jpg"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "_id": "64a1b2c3d4e5f67890cat002",
    "name": "Quần",
    "images": {
      "public_id": "categories/def456",
      "url": "https://res.cloudinary.com/xxx/category2.jpg"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### 2. POST `/api/category` — Tạo danh mục [🔐 Admin]
```bash
curl -X POST http://localhost:5000/api/category \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=Phụ kiện" \
  -F "file=@/path/to/image.jpg"
```
**Response 200:**
```json
{
  "msg": "Tạo danh mục thành công",
  "category": {
    "_id": "64a1b2c3d4e5f67890cat003",
    "name": "Phụ kiện",
    "images": {
      "public_id": "categories/ghi789",
      "url": "https://res.cloudinary.com/xxx/category3.jpg"
    },
    "createdAt": "2025-02-20T10:00:00.000Z",
    "updatedAt": "2025-02-20T10:00:00.000Z"
  }
}
```
**Response 400:**
```json
{ "msg": "Danh mục đã tồn tại." }
```

---

### 3. PUT `/api/category/:id` — Cập nhật danh mục [🔐 Admin]
```bash
curl -X PUT http://localhost:5000/api/category/64a1b2c3d4e5f67890cat001 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Áo sơ mi"}'
```
**Response 200:**
```json
{ "msg": "Cập nhật thành công." }
```

---

### 4. DELETE `/api/category/:id` — Xóa danh mục [🔐 Admin]
```bash
curl -X DELETE http://localhost:5000/api/category/64a1b2c3d4e5f67890cat003 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Response 200:**
```json
{ "msg": "Xóa thành công." }
```
**Response 400:**
```json
{ "msg": "Vui lòng xóa các sản phẩm có liên quan." }
```

---

### 5. PUT `/api/category/:id/image` — Cập nhật ảnh danh mục [🔐 Admin]
```bash
curl -X PUT http://localhost:5000/api/category/64a1b2c3d4e5f67890cat001/image \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@/path/to/new-image.jpg"
```
**Response 200:**
```json
{
  "msg": "Cập nhật ảnh danh mục thành công",
  "category": {
    "_id": "64a1b2c3d4e5f67890cat001",
    "name": "Áo",
    "images": {
      "public_id": "categories/new_img_123",
      "url": "https://res.cloudinary.com/xxx/new-category.jpg"
    }
  }
}
```

---

## 🎨 Banner APIs

### 1. GET `/api/banners` — Lấy tất cả banner
```bash
curl -X GET "http://localhost:5000/api/banners?active=true"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 3,
  "banners": [
    {
      "_id": "64a1b2c3d4e5f67890ban001",
      "title": "Summer Sale 50%",
      "image": {
        "public_id": "banners/abc123",
        "url": "https://res.cloudinary.com/xxx/banner1.jpg"
      },
      "link": "/sale",
      "order": 1,
      "active": true,
      "createdAt": "2025-01-15T00:00:00.000Z",
      "updatedAt": "2025-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### 2. GET `/api/banners/:id` — Lấy chi tiết banner
```bash
curl -X GET http://localhost:5000/api/banners/64a1b2c3d4e5f67890ban001
```
**Response 200:**
```json
{
  "status": "success",
  "banner": {
    "_id": "64a1b2c3d4e5f67890ban001",
    "title": "Summer Sale 50%",
    "image": {
      "public_id": "banners/abc123",
      "url": "https://res.cloudinary.com/xxx/banner1.jpg"
    },
    "link": "/sale",
    "order": 1,
    "active": true
  }
}
```

---

### 3. POST `/api/banners` — Tạo banner [🔐 Admin]
```bash
curl -X POST http://localhost:5000/api/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=New Collection" \
  -F "link=/new" \
  -F "order=2" \
  -F "active=true" \
  -F "file=@/path/to/banner.jpg"
```
**Response 200:**
```json
{
  "msg": "Tạo banner thành công",
  "banner": {
    "_id": "64a1b2c3d4e5f67890ban002",
    "title": "New Collection",
    "image": {
      "public_id": "banners/def456",
      "url": "https://res.cloudinary.com/xxx/banner2.jpg"
    },
    "link": "/new",
    "order": 2,
    "active": true
  }
}
```

---

### 4. PUT `/api/banners/:id` — Cập nhật banner (không ảnh) [🔐 Admin]
```bash
curl -X PUT http://localhost:5000/api/banners/64a1b2c3d4e5f67890ban001 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Banner","link":"/updated","active":"false"}'
```
**Response 200:**
```json
{ "msg": "Cập nhật banner thành công" }
```

---

### 5. DELETE `/api/banners/:id` — Xóa banner [🔐 Admin]
```bash
curl -X DELETE http://localhost:5000/api/banners/64a1b2c3d4e5f67890ban001 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Response 200:**
```json
{ "msg": "Xóa banner thành công" }
```

---

### 6. PUT `/api/banners/:id/image` — Cập nhật ảnh banner [🔐 Admin]
```bash
curl -X PUT http://localhost:5000/api/banners/64a1b2c3d4e5f67890ban001/image \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@/path/to/new-banner.jpg"
```
**Response 200:**
```json
{
  "msg": "Cập nhật ảnh banner thành công",
  "banner": {
    "_id": "64a1b2c3d4e5f67890ban001",
    "title": "Summer Sale 50%",
    "image": {
      "public_id": "banners/new_123",
      "url": "https://res.cloudinary.com/xxx/new-banner.jpg"
    }
  }
}
```

---

## 💬 Chat AI APIs

### 1. POST `/api/chat` — Gửi tin nhắn chat AI
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Có áo nào dưới 500k không?","session_id":"session_1709000000_abc123def"}'
```
**Response 200:**
```json
{
  "status": "success",
  "message": "Dạ có nhiều mẫu áo đẹp dưới 500k ạ:\n\n1. **Áo sơ mi Oxford trắng** - 280,000 VNĐ\n   📏 Size: S, M, L, XL\n   🎨 Màu: Trắng, Xanh\n\nBạn thích mẫu nào?",
  "session_id": "session_1709000000_abc123def",
  "products": [
    {
      "_id": "64a1b2c3d4e5f67890abc001",
      "title": "áo sơ mi trắng oxford",
      "price": 250000,
      "images": { "url": "https://res.cloudinary.com/xxx/image.jpg" }
    }
  ]
}
```
**Response (session mới — chưa có session_id):**
```json
{
  "status": "success",
  "message": "Xin chào! Mình có thể giúp gì cho bạn?",
  "session_id": "session_1709000000_abc123def",
  "products": [],
  "keywords": {
    "sizes": [],
    "colors": [],
    "types": [],
    "searchTerms": [],
    "priceRange": { "minPrice": null, "maxPrice": null, "hasPriceQuery": false }
  }
}
```
**Response 400:**
```json
{ "msg": "Vui lòng nhập câu hỏi" }
```

---

### 2. POST `/api/chat/session` — Tạo session mới
```bash
curl -X POST http://localhost:5000/api/chat/session \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Response 200:**
```json
{
  "status": "success",
  "session_id": "session_1709000000_abc123def",
  "msg": "Session ID được tạo (chưa lưu database)"
}
```

---

### 3. GET `/api/chat/history/:session_id` — Lấy lịch sử chat
```bash
curl -X GET http://localhost:5000/api/chat/history/session_1709000000_abc123def
```
**Response 200 (có dữ liệu):**
```json
{
  "status": "success",
  "messages": [
    {
      "role": "user",
      "content": "Có áo nào dưới 500k không?",
      "timestamp": "2025-02-20T10:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Dạ có nhiều mẫu áo đẹp dưới 500k ạ...",
      "timestamp": "2025-02-20T10:00:02.000Z"
    }
  ],
  "session_id": "session_1709000000_abc123def"
}
```
**Response 200 (chưa có chat):**
```json
{
  "status": "success",
  "messages": []
}
```

---

### 4. DELETE `/api/chat/history/:session_id` — Xóa lịch sử chat
```bash
curl -X DELETE http://localhost:5000/api/chat/history/session_1709000000_abc123def
```
**Response 200:**
```json
{ "msg": "Xóa lịch sử chat thành công" }
```

---

## 👨‍💼 Admin Chat APIs

### 1. GET `/api/admin-list` — Danh sách admin
```bash
curl -X GET http://localhost:5000/api/admin-list
```
**Response 200:**
```json
{
  "status": "success",
  "admins": [
    {
      "_id": "64a1b2c3d4e5f67890adm001",
      "name": "Admin Lamia",
      "email": "admin@lamia.com",
      "avatar": null
    }
  ]
}
```

---

### 2. GET `/api/all-user-chats` — Tất cả AI chats (admin xem)
```bash
curl -X GET http://localhost:5000/api/all-user-chats
```
**Response 200:**
```json
{
  "status": "success",
  "chats": [
    {
      "_id": "64a1b2c3d4e5f67890cha001",
      "session_id": "session_1709000000_abc123def",
      "user_id": {
        "_id": "64a1b2c3d4e5f67890abcdef",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "messages": [
        { "role": "user", "content": "Xin chào", "timestamp": "2025-02-20T10:00:00.000Z" },
        { "role": "assistant", "content": "Xin chào! Mình có thể giúp gì?", "timestamp": "2025-02-20T10:00:02.000Z" }
      ],
      "updatedAt": "2025-02-20T10:00:02.000Z"
    }
  ]
}
```

---

### 3. GET `/api/all-chats` — Tất cả admin chats (có messages)
```bash
curl -X GET http://localhost:5000/api/all-chats
```
**Response 200:**
```json
{
  "status": "success",
  "chats": [
    {
      "_id": "64a1b2c3d4e5f67890adch01",
      "user_id": {
        "_id": "64a1b2c3d4e5f67890abcdef",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "admin_id": {
        "_id": "64a1b2c3d4e5f67890adm001",
        "name": "Admin Lamia",
        "email": "admin@lamia.com"
      },
      "messages": [
        {
          "sender": "user",
          "content": "Tôi cần hỗ trợ đơn hàng",
          "timestamp": "2025-02-20T10:00:00.000Z"
        },
        {
          "sender": "admin",
          "content": "Vâng, mình kiểm tra ngay cho bạn nhé",
          "timestamp": "2025-02-20T10:01:00.000Z"
        }
      ],
      "status": "active",
      "updatedAt": "2025-02-20T10:01:00.000Z"
    }
  ]
}
```

---

### 4. POST `/api/consolidate-chats` — Gộp chats về admin chính
```bash
curl -X POST http://localhost:5000/api/consolidate-chats
```
**Response 200:**
```json
{
  "status": "success",
  "msg": "Consolidation complete",
  "deletedEmptyCount": 5,
  "consolidatedCount": 3,
  "deletedCount": 2
}
```

---

### 5. GET `/api/admin-chats/:userId` — Danh sách chat của user
```bash
curl -X GET http://localhost:5000/api/admin-chats/64a1b2c3d4e5f67890abcdef
```
**Response 200:**
```json
{
  "status": "success",
  "chats": [
    {
      "_id": "64a1b2c3d4e5f67890adch01",
      "user_id": "64a1b2c3d4e5f67890abcdef",
      "admin_id": {
        "_id": "64a1b2c3d4e5f67890adm001",
        "name": "Admin Lamia",
        "email": "admin@lamia.com"
      },
      "messages": [],
      "status": "active",
      "updatedAt": "2025-02-20T10:00:00.000Z"
    }
  ]
}
```

---

### 6. GET `/api/admin-chat/:userId` — Lịch sử chat user với admin chính
```bash
curl -X GET http://localhost:5000/api/admin-chat/64a1b2c3d4e5f67890abcdef
```
**Response 200 (có chat):**
```json
{
  "status": "success",
  "chat": {
    "_id": "64a1b2c3d4e5f67890adch01",
    "user_id": {
      "_id": "64a1b2c3d4e5f67890abcdef",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "admin_id": {
      "_id": "64a1b2c3d4e5f67890adm001",
      "name": "Admin Lamia",
      "email": "admin@lamia.com"
    },
    "messages": [
      {
        "sender": "user",
        "content": "Đơn hàng của tôi đâu rồi?",
        "timestamp": "2025-02-20T10:00:00.000Z"
      }
    ],
    "status": "active",
    "createdAt": "2025-02-20T09:00:00.000Z"
  }
}
```
**Response 200 (chưa có chat):**
```json
{
  "status": "success",
  "chat": {
    "_id": null,
    "user_id": "64a1b2c3d4e5f67890abcdef",
    "admin_id": "64a1b2c3d4e5f67890adm001",
    "messages": [],
    "status": "active",
    "createdAt": "2025-02-20T10:00:00.000Z"
  }
}
```

---

### 7. POST `/api/admin-chat` — Tạo hoặc lấy chat room
```bash
curl -X POST http://localhost:5000/api/admin-chat \
  -H "Content-Type: application/json" \
  -d '{"user_id":"64a1b2c3d4e5f67890abcdef","admin_id":"64a1b2c3d4e5f67890adm001"}'
```
**Response 200:**
```json
{
  "status": "success",
  "chat": {
    "_id": "64a1b2c3d4e5f67890adch01",
    "user_id": "64a1b2c3d4e5f67890abcdef",
    "admin_id": "64a1b2c3d4e5f67890adm001",
    "messages": [],
    "status": "active",
    "createdAt": "2025-02-20T10:00:00.000Z",
    "updatedAt": "2025-02-20T10:00:00.000Z"
  }
}
```

---

### 8. PUT `/api/admin-chat/close/:chatId` — Đóng chat
```bash
curl -X PUT http://localhost:5000/api/admin-chat/close/64a1b2c3d4e5f67890adch01
```
**Response 200:**
```json
{
  "status": "success",
  "msg": "Đã đóng cuộc trò chuyện"
}
```

---

### 9. POST `/api/cleanup-empty-chats` — Xóa chats trống
```bash
curl -X POST http://localhost:5000/api/cleanup-empty-chats
```
**Response 200:**
```json
{
  "status": "success",
  "msg": "Xóa 5 cuộc trò chuyện trống",
  "deletedCount": 5
}
```

---

### 10. GET `/api/debug/health` — Health check
```bash
curl -X GET http://localhost:5000/api/debug/health
```
**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2025-02-20T10:00:00.000Z"
}
```

---

## 💳 Payment APIs

### 1. POST `/api/payment` — Tạo Stripe checkout [🔐 Auth]
```bash
curl -X POST http://localhost:5000/api/payment \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lineItems": [
      {
        "price_data": {
          "currency": "vnd",
          "product_data": { "name": "Áo sơ mi trắng" },
          "unit_amount": 250000
        },
        "quantity": 2
      }
    ]
  }'
```
**Response 201:**
```json
{
  "id": "cs_test_xxxxxxxxxxxxx",
  "object": "checkout.session",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx",
  "payment_status": "unpaid",
  "status": "open",
  "mode": "payment",
  "amount_total": 500000,
  "currency": "vnd"
}
```

---

### 2. GET `/api/success/:id` — Lấy kết quả thanh toán Stripe [🔐 Auth]
```bash
curl -X GET http://localhost:5000/api/success/cs_test_xxxxxxxxxxxxx \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Response 200:**
```json
{
  "id": "cs_test_xxxxxxxxxxxxx",
  "object": "checkout.session",
  "payment_status": "paid",
  "status": "complete",
  "amount_total": 500000,
  "currency": "vnd",
  "customer_email": "john@example.com"
}
```

---

### 3. POST `/api/update-payment` — Lưu đơn hàng sau thanh toán [🔐 Auth]
```bash
curl -X POST http://localhost:5000/api/update-payment \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cart": [
      {"_id":"64a1b2c3d4e5f67890abc001","title":"áo sơ mi","price":250000,"quantity":2,"sold":10}
    ],
    "paymentID": "cs_test_xxxxx",
    "address": "123 Nguyễn Huệ, Q1, HCM",
    "status": true,
    "paymentMethod": "stripe",
    "discount": 50000,
    "couponId": "64a1b2c3d4e5f67890cou001"
  }'
```
**Response 200:**
```json
{ "msg": "Payment Success!" }
```

---

### 4. GET `/api/payment` — Lấy tất cả đơn hàng [🔐 Admin]
```bash
curl -X GET http://localhost:5000/api/payment \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Response 200:**
```json
[
  {
    "_id": "64b2c3d4e5f67890abcdef01",
    "user_id": "64a1b2c3d4e5f67890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "paymentID": "cs_test_xxxxx",
    "address": "123 Nguyễn Huệ, Q1, HCM",
    "cart": [
      {
        "_id": "64a1b2c3d4e5f67890abc001",
        "title": "áo sơ mi",
        "price": 250000,
        "quantity": 2
      }
    ],
    "status": true,
    "paymentMethod": "stripe",
    "deliveryStatus": "pending",
    "discount": 50000,
    "totalAmount": 450000,
    "createdAt": "2025-02-01T14:20:00.000Z"
  }
]
```

---

### 5. POST `/api/cash-payment` — Tạo đơn hàng COD [🔐 Auth]
```bash
curl -X POST http://localhost:5000/api/cash-payment \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cart": [
      {"_id":"64a1b2c3d4e5f67890abc001","title":"áo sơ mi","price":250000,"quantity":1,"sold":10}
    ],
    "address": "456 Lê Lợi, Q1, HCM",
    "discount": 0
  }'
```
**Response 201:**
```json
{
  "msg": "Cash order created successfully!",
  "payment": {
    "_id": "64b2c3d4e5f67890abcdef02",
    "user_id": "64a1b2c3d4e5f67890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "paymentID": "CASH_1709000000000",
    "address": "456 Lê Lợi, Q1, HCM",
    "cart": [
      {
        "_id": "64a1b2c3d4e5f67890abc001",
        "title": "áo sơ mi",
        "price": 250000,
        "quantity": 1
      }
    ],
    "status": false,
    "paymentMethod": "cash",
    "deliveryStatus": "pending",
    "discount": 0,
    "totalAmount": 250000,
    "createdAt": "2025-02-20T10:00:00.000Z"
  }
}
```

---

### 6. PATCH `/api/update-delivery-status` — Cập nhật trạng thái giao hàng [🔐 Auth]
```bash
curl -X PATCH http://localhost:5000/api/update-delivery-status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"64b2c3d4e5f67890abcdef01","deliveryStatus":"shipping"}'
```
**Response 200:**
```json
{
  "msg": "Delivery status updated",
  "payment": {
    "_id": "64b2c3d4e5f67890abcdef01",
    "user_id": "64a1b2c3d4e5f67890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "paymentID": "cs_test_xxxxx",
    "deliveryStatus": "shipping",
    "status": true,
    "paymentMethod": "stripe",
    "totalAmount": 450000
  }
}
```
> **Delivery status values:** `pending` | `shipping` | `delivered` | `cancelled`

**Response 403 (user cố update status không hợp lệ):**
```json
{ "msg": "You can only confirm delivery status" }
```

---

## 🎟️ Coupon APIs

### 1. GET `/api/coupon` — Lấy tất cả coupon
```bash
curl -X GET "http://localhost:5000/api/coupon?isActive=true"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 3,
  "coupons": [
    {
      "_id": "64a1b2c3d4e5f67890cou001",
      "code": "SAVE20",
      "description": "Giảm 20% cho đơn từ 500k",
      "discountType": "percentage",
      "discountValue": 20,
      "maxDiscount": 100000,
      "expiryDate": "2026-12-31T23:59:59.000Z",
      "startDate": "2025-01-01T00:00:00.000Z",
      "applicableProducts": [],
      "applicableCategories": [],
      "usageLimit": 100,
      "usageCount": 15,
      "usagePerUser": 1,
      "minOrderValue": 500000,
      "isActive": true,
      "usedBy": [],
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. GET `/api/coupon/:id` — Chi tiết coupon
```bash
curl -X GET http://localhost:5000/api/coupon/64a1b2c3d4e5f67890cou001
```
**Response 200:**
```json
{
  "status": "success",
  "coupon": {
    "_id": "64a1b2c3d4e5f67890cou001",
    "code": "SAVE20",
    "description": "Giảm 20% cho đơn từ 500k",
    "discountType": "percentage",
    "discountValue": 20,
    "maxDiscount": 100000,
    "expiryDate": "2026-12-31T23:59:59.000Z",
    "startDate": "2025-01-01T00:00:00.000Z",
    "applicableProducts": [],
    "applicableCategories": [],
    "usageLimit": 100,
    "usageCount": 15,
    "usagePerUser": 1,
    "minOrderValue": 500000,
    "isActive": true
  }
}
```

---

### 3. POST `/api/coupon` — Tạo coupon [🔐 Admin]
```bash
curl -X POST http://localhost:5000/api/coupon \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NEWUSER50",
    "description": "Giảm 50k cho khách mới",
    "discountType": "fixed",
    "discountValue": 50000,
    "expiryDate": "2026-06-30",
    "usageLimit": 200,
    "usagePerUser": 1,
    "minOrderValue": 300000
  }'
```
**Response 200:**
```json
{
  "msg": "Tạo coupon thành công",
  "coupon": {
    "_id": "64a1b2c3d4e5f67890cou002",
    "code": "NEWUSER50",
    "description": "Giảm 50k cho khách mới",
    "discountType": "fixed",
    "discountValue": 50000,
    "expiryDate": "2026-06-30T00:00:00.000Z",
    "startDate": "2025-02-20T10:00:00.000Z",
    "usageLimit": 200,
    "usageCount": 0,
    "usagePerUser": 1,
    "minOrderValue": 300000,
    "isActive": true,
    "applicableProducts": [],
    "applicableCategories": [],
    "usedBy": []
  }
}
```
**Response 400:**
```json
{ "msg": "Mã coupon này đã tồn tại" }
```

---

### 4. PATCH `/api/coupon/:id` — Cập nhật coupon [🔐 Admin]
```bash
curl -X PATCH http://localhost:5000/api/coupon/64a1b2c3d4e5f67890cou001 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"discountValue":25,"isActive":false}'
```
**Response 200:**
```json
{
  "msg": "Cập nhật coupon thành công",
  "coupon": {
    "_id": "64a1b2c3d4e5f67890cou001",
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 25,
    "isActive": false
  }
}
```

---

### 5. DELETE `/api/coupon/:id` — Xóa coupon [🔐 Admin]
```bash
curl -X DELETE http://localhost:5000/api/coupon/64a1b2c3d4e5f67890cou001 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Response 200:**
```json
{ "msg": "Xóa coupon thành công" }
```

---

### 6. POST `/api/coupon/validate` — Kiểm tra coupon hợp lệ
```bash
curl -X POST http://localhost:5000/api/coupon/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "cart": [
      {"_id":"64a1b2c3d4e5f67890abc001","price":250000,"quantity":3,"category":"Áo"}
    ],
    "userId": "64a1b2c3d4e5f67890abcdef"
  }'
```
**Response 200:**
```json
{
  "status": "success",
  "msg": "Coupon hợp lệ",
  "coupon": {
    "_id": "64a1b2c3d4e5f67890cou001",
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "maxDiscount": 100000,
    "description": "Giảm 20% cho đơn từ 500k"
  },
  "discount": 100000,
  "applicableTotal": 750000,
  "finalTotal": 650000
}
```
**Response 400:**
```json
{ "msg": "Coupon này đã hết hạn" }
```
```json
{ "msg": "Giá trị đơn hàng tối thiểu là 500,000 VND" }
```
```json
{ "msg": "Bạn chỉ được sử dụng coupon này 1 lần" }
```

---

### 7. POST `/api/coupon/apply` — Áp dụng coupon (cập nhật usage) [🔐 Auth]
```bash
curl -X POST http://localhost:5000/api/coupon/apply \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"couponId":"64a1b2c3d4e5f67890cou001","userId":"64a1b2c3d4e5f67890abcdef"}'
```
**Response 200:**
```json
{
  "msg": "Áp dụng coupon thành công",
  "coupon": {
    "_id": "64a1b2c3d4e5f67890cou001",
    "code": "SAVE20",
    "usageCount": 16,
    "usedBy": [
      {
        "userId": "64a1b2c3d4e5f67890abcdef",
        "usedAt": "2025-02-20T10:00:00.000Z",
        "count": 1
      }
    ]
  }
}
```

---

## 📰 News APIs

### 1. GET `/api/news` — Lấy danh sách tin tức
```bash
curl -X GET "http://localhost:5000/api/news?page=1&limit=10&category=CATEGORY_ID&isFeatured=true"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 5,
  "total": 50,
  "page": 1,
  "pages": 5,
  "news": [
    {
      "_id": "64a1b2c3d4e5f67890new001",
      "title": "Xu hướng thời trang 2025",
      "slug": "xu-hng-thi-trang-2025",
      "description": "Tổng hợp xu hướng thời trang hot nhất...",
      "content": "<p>Nội dung bài viết...</p>",
      "image": { "public_id": "news/abc123", "url": "https://res.cloudinary.com/xxx/news1.jpg" },
      "category": { "_id": "64a1b2c3d4e5f67890ncat01", "name": "Thời trang", "slug": "thoi-trang" },
      "author": { "_id": "64a1b2c3d4e5f67890adm001", "name": "Admin" },
      "tags": ["thời trang", "xu hướng", "2025"],
      "isFeatured": true,
      "isPublished": true,
      "views": 1250,
      "likes": 89,
      "publishedAt": "2025-02-15T08:00:00.000Z",
      "createdAt": "2025-02-15T07:30:00.000Z"
    }
  ]
}
```

---

### 2. GET `/api/news/featured` — Tin tức nổi bật
```bash
curl -X GET "http://localhost:5000/api/news/featured?limit=5"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 3,
  "news": [
    {
      "_id": "64a1b2c3d4e5f67890new001",
      "title": "Xu hướng thời trang 2025",
      "slug": "xu-hng-thi-trang-2025",
      "image": { "url": "https://res.cloudinary.com/xxx/news1.jpg" },
      "category": { "name": "Thời trang", "slug": "thoi-trang" },
      "author": { "name": "Admin" },
      "isFeatured": true,
      "views": 1250,
      "likes": 89,
      "publishedAt": "2025-02-15T08:00:00.000Z"
    }
  ]
}
```

---

### 3. GET `/api/news/trending` — Tin tức trending
```bash
curl -X GET "http://localhost:5000/api/news/trending?limit=10&days=7"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 5,
  "news": [
    {
      "_id": "64a1b2c3d4e5f67890new002",
      "title": "Sale cuối năm giảm đến 70%",
      "slug": "sale-cui-nm-gim-n-70",
      "category": { "name": "Khuyến mãi", "slug": "khuyen-mai" },
      "author": { "name": "Admin" },
      "views": 5000,
      "likes": 320,
      "publishedAt": "2025-02-18T10:00:00.000Z"
    }
  ]
}
```

---

### 4. GET `/api/news/category/:slug` — Tin tức theo danh mục
```bash
curl -X GET "http://localhost:5000/api/news/category/thoi-trang?page=1&limit=10"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 3,
  "total": 15,
  "page": 1,
  "pages": 2,
  "category": {
    "_id": "64a1b2c3d4e5f67890ncat01",
    "name": "Thời trang",
    "slug": "thoi-trang"
  },
  "news": [
    {
      "_id": "64a1b2c3d4e5f67890new001",
      "title": "Xu hướng thời trang 2025",
      "slug": "xu-hng-thi-trang-2025",
      "category": { "name": "Thời trang", "slug": "thoi-trang" },
      "author": { "name": "Admin" },
      "views": 1250,
      "publishedAt": "2025-02-15T08:00:00.000Z"
    }
  ]
}
```
**Response 404:**
```json
{ "msg": "Không tìm thấy danh mục tin tức" }
```

---

### 5. GET `/api/news/:slug` — Chi tiết tin tức
```bash
curl -X GET http://localhost:5000/api/news/xu-hng-thi-trang-2025
```
**Response 200:**
```json
{
  "status": "success",
  "news": {
    "_id": "64a1b2c3d4e5f67890new001",
    "title": "Xu hướng thời trang 2025",
    "slug": "xu-hng-thi-trang-2025",
    "description": "Tổng hợp xu hướng...",
    "content": "<p>Nội dung đầy đủ bài viết HTML...</p>",
    "image": { "public_id": "news/abc123", "url": "https://res.cloudinary.com/xxx/news1.jpg" },
    "category": { "_id": "64a1b2c3d4e5f67890ncat01", "name": "Thời trang", "slug": "thoi-trang" },
    "author": { "_id": "64a1b2c3d4e5f67890adm001", "name": "Admin", "email": "admin@lamia.com" },
    "tags": ["thời trang", "xu hướng"],
    "isFeatured": true,
    "isPublished": true,
    "views": 1251,
    "likes": 89,
    "publishedAt": "2025-02-15T08:00:00.000Z"
  }
}
```

---

### 6. POST `/api/news/:id/like` — Like tin tức
```bash
curl -X POST http://localhost:5000/api/news/64a1b2c3d4e5f67890new001/like
```
**Response 200:**
```json
{
  "msg": "Like thành công",
  "likes": 90
}
```

---

### 7. POST `/api/news` — Tạo tin tức [🔐 Admin]
```bash
curl -X POST http://localhost:5000/api/news \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bộ sưu tập mùa xuân 2026",
    "description": "Mô tả ngắn...",
    "content": "<p>Nội dung HTML bài viết...</p>",
    "image": {"public_id":"news/abc","url":"https://res.cloudinary.com/xxx/img.jpg"},
    "category": "64a1b2c3d4e5f67890ncat01",
    "tags": ["spring", "collection"],
    "isFeatured": false
  }'
```
**Response 200:**
```json
{
  "msg": "Tạo tin tức thành công",
  "news": {
    "_id": "64a1b2c3d4e5f67890new003",
    "title": "Bộ sưu tập mùa xuân 2026",
    "slug": "b-su-tp-ma-xun-2026",
    "description": "Mô tả ngắn...",
    "content": "<p>Nội dung HTML bài viết...</p>",
    "image": { "url": "https://res.cloudinary.com/xxx/img.jpg" },
    "category": { "name": "Thời trang", "slug": "thoi-trang" },
    "author": { "name": "Admin" },
    "tags": ["spring", "collection"],
    "isFeatured": false,
    "isPublished": true,
    "views": 0,
    "likes": 0,
    "publishedAt": "2025-02-20T10:00:00.000Z"
  }
}
```

---

### 8. PATCH `/api/news/:id` — Cập nhật tin tức [🔐 Admin]
```bash
curl -X PATCH http://localhost:5000/api/news/64a1b2c3d4e5f67890new001 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Tiêu đề mới","isFeatured":true}'
```
**Response 200:**
```json
{
  "msg": "Cập nhật tin tức thành công",
  "news": {
    "_id": "64a1b2c3d4e5f67890new001",
    "title": "Tiêu đề mới",
    "slug": "tiu-mi",
    "isFeatured": true,
    "category": { "name": "Thời trang", "slug": "thoi-trang" },
    "author": { "name": "Admin" }
  }
}
```

---

### 9. DELETE `/api/news/:id` — Xóa tin tức [🔐 Admin]
```bash
curl -X DELETE http://localhost:5000/api/news/64a1b2c3d4e5f67890new001 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Response 200:**
```json
{ "msg": "Xóa tin tức thành công" }
```

---

## 📂 News Category APIs

### 1. GET `/api/news/categories` — Tất cả danh mục tin tức
```bash
curl -X GET "http://localhost:5000/api/news/categories?isActive=true"
```
**Response 200:**
```json
{
  "status": "success",
  "result": 4,
  "categories": [
    {
      "_id": "64a1b2c3d4e5f67890ncat01",
      "name": "Thời trang",
      "slug": "thoi-trang",
      "description": "Tin tức về thời trang",
      "image": { "url": "https://res.cloudinary.com/xxx/cat1.jpg" },
      "order": 1,
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f67890ncat02",
      "name": "Khuyến mãi",
      "slug": "khuyen-mai",
      "description": "Tin khuyến mãi",
      "order": 2,
      "isActive": true
    }
  ]
}
```

---

### 2. GET `/api/news/categories/:slug` — Danh mục tin tức theo slug
```bash
curl -X GET http://localhost:5000/api/news/categories/thoi-trang
```
**Response 200:**
```json
{
  "status": "success",
  "category": {
    "_id": "64a1b2c3d4e5f67890ncat01",
    "name": "Thời trang",
    "slug": "thoi-trang",
    "description": "Tin tức về thời trang",
    "order": 1,
    "isActive": true
  }
}
```

---

### 3. GET `/api/news/category/:id` — Danh mục tin tức theo ID
```bash
curl -X GET http://localhost:5000/api/news/category/64a1b2c3d4e5f67890ncat01
```
**Response 200:**
```json
{
  "status": "success",
  "category": {
    "_id": "64a1b2c3d4e5f67890ncat01",
    "name": "Thời trang",
    "slug": "thoi-trang",
    "description": "Tin tức về thời trang",
    "order": 1,
    "isActive": true
  }
}
```

---

### 4. POST `/api/news/categories` — Tạo danh mục tin tức [🔐 Admin]
```bash
curl -X POST http://localhost:5000/api/news/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mẹo thời trang","description":"Tips & tricks thời trang","order":3}'
```
**Response 200:**
```json
{
  "msg": "Tạo danh mục thành công",
  "category": {
    "_id": "64a1b2c3d4e5f67890ncat03",
    "name": "Mẹo thời trang",
    "slug": "mo-thi-trang",
    "description": "Tips & tricks thời trang",
    "order": 3,
    "isActive": true,
    "createdAt": "2025-02-20T10:00:00.000Z"
  }
}
```
**Response 400:**
```json
{ "msg": "Danh mục này đã tồn tại" }
```

---

### 5. PATCH `/api/news/categories/:id` — Cập nhật danh mục tin tức [🔐 Admin]
```bash
curl -X PATCH http://localhost:5000/api/news/categories/64a1b2c3d4e5f67890ncat01 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Fashion News","isActive":true}'
```
**Response 200:**
```json
{
  "msg": "Cập nhật danh mục thành công",
  "category": {
    "_id": "64a1b2c3d4e5f67890ncat01",
    "name": "Fashion News",
    "slug": "fashion-news",
    "isActive": true
  }
}
```

---

### 6. DELETE `/api/news/categories/:id` — Xóa danh mục tin tức [🔐 Admin]
```bash
curl -X DELETE http://localhost:5000/api/news/categories/64a1b2c3d4e5f67890ncat03 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Response 200:**
```json
{ "msg": "Xóa danh mục thành công" }
```
**Response 400:**
```json
{ "msg": "Không thể xóa danh mục có 5 tin tức. Vui lòng xóa hoặc chuyển các tin tức trước." }
```

---

## 📧 Contact APIs

### 1. POST `/api/contact/send-mail` — Gửi liên hệ
```bash
curl -X POST http://localhost:5000/api/contact/send-mail \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "phone": "0901234567",
    "subject": "Hỏi về sản phẩm",
    "message": "Tôi muốn hỏi về áo sơ mi trắng size M còn hàng không?"
  }'
```
**Response 200:**
```json
{ "msg": "Gửi tin nhắn thành công!" }
```
**Response 400:**
```json
{ "msg": "Vui lòng điền đầy đủ tất cả các trường" }
```
```json
{ "msg": "Email không hợp lệ" }
```

---

### 2. GET `/api/contact/all` — Tất cả liên hệ [🔐 Admin]
```bash
curl -X GET http://localhost:5000/api/contact/all \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Response 200:**
```json
[
  {
    "_id": "64a1b2c3d4e5f67890con001",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "phone": "0901234567",
    "subject": "Hỏi về sản phẩm",
    "message": "Tôi muốn hỏi về áo sơ mi trắng size M còn hàng không?",
    "status": "new",
    "createdAt": "2025-02-20T10:00:00.000Z",
    "updatedAt": "2025-02-20T10:00:00.000Z"
  }
]
```

---

### 3. PATCH `/api/contact/:id/read` — Đánh dấu đã đọc [🔐 Admin]
```bash
curl -X PATCH http://localhost:5000/api/contact/64a1b2c3d4e5f67890con001/read \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Response 200:**
```json
{
  "_id": "64a1b2c3d4e5f67890con001",
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "phone": "0901234567",
  "subject": "Hỏi về sản phẩm",
  "message": "Tôi muốn hỏi...",
  "status": "read",
  "createdAt": "2025-02-20T10:00:00.000Z",
  "updatedAt": "2025-02-20T10:05:00.000Z"
}
```

---

### 4. DELETE `/api/contact/:id` — Xóa liên hệ [🔐 Admin]
```bash
curl -X DELETE http://localhost:5000/api/contact/64a1b2c3d4e5f67890con001 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Response 200:**
```json
{ "msg": "Xóa tin nhắn thành công" }
```

---

## 📤 Upload APIs

### 1. POST `/api/upload` — Upload ảnh lên Cloudinary [🔐 Admin]
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@/path/to/image.jpg"
```
**Response 200:**
```json
{
  "public_id": "uploader/abc123xyz",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1709000000/uploader/abc123xyz.jpg"
}
```
**Response 400:**
```json
{ "msg": "File không đúng định dạng (JPG, PNG, WebP)" }
```
```json
{ "msg": "File không được lớn hơn 1mb" }
```

---

### 2. POST `/api/destroy` — Xóa ảnh trên Cloudinary [🔐 Admin]
```bash
curl -X POST http://localhost:5000/api/destroy \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"public_id":"uploader/abc123xyz"}'
```
**Response 200:**
```json
{ "msg": "Deleted Image" }
```

---

## 📝 Chú thích

| Icon | Ý nghĩa |
|------|---------|
| 🔐 Auth | Cần header `Authorization: Bearer ACCESS_TOKEN` |
| 🔐 Admin | Cần token của user có `role: 1` |
| 🌐 Public | Không cần authentication |

### Error Response chung
Tất cả API khi lỗi server đều trả về:
```json
{ "msg": "Error message here" }
```
với HTTP status code `500`.

### Authentication Flow
```
1. Register/Login  →  Nhận access token (body) + refresh token (httpOnly cookie)
2. Gọi API        →  Header: Authorization: Bearer <access_token>
3. Token hết hạn   →  GET /user/refresh_token → accesstoken mới
4. Logout          →  GET /user/logout → xóa cookie
```

### Delivery Status Flow
```
pending → shipping → delivered
                   → cancelled
```

---

**Tổng: 62 API endpoints | 12 nhóm API | Last Updated: March 2, 2026**
