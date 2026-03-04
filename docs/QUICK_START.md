# 🚀 Quick Start Guide

## Các tính năng mới được thêm

### 1. 💳 Thanh toán Tiền mặt (Cash Payment)
- User có thể chọn thanh toán tiền mặt khi giao hàng
- Nhập địa chỉ giao hàng
- Order status: pending → shipping → delivered

### 2. 📦 Quản lý Trạng thái Đơn hàng
- Theo dõi tiến độ: pending, shipping, delivered, cancelled
- Admin có thể update status
- User có thể xác nhận đã nhận hàng

### 3. 💰 Hệ thống Mã giảm giá (Coupon)
- Admin tạo coupon với % hoặc số tiền cố định
- Áp dụng cho sản phẩm/danh mục cụ thể
- Có hạn sử dụng và ngày hết hạn
- User apply coupon trong giỏ hàng

### 4. 📰 Hệ thống Tin tức (News)
- Hiển thị tin tức cho user
- Quản lý tin tức cho admin
- Danh mục tin tức
- Tính năng: search, filter, like, view count

---

## 🔧 Setup & Installation

### 1. Backend Setup

```bash
# Install dependencies (nếu chưa)
npm install

# Tạo database collections
# Collections sẽ tự tạo khi đầu tiên insert data

# Khởi động server
npm start
# hoặc
npm run dev
```

### 2. Frontend Setup

```bash
cd client

# Install dependencies (nếu chưa)
npm install

# Khởi động dev server
npm start
```

---

## 📝 How to Use

### For Users

#### 💳 Thanh toán Tiền mặt
1. Thêm sản phẩm vào giỏ hàng
2. Vào trang `/cart`
3. Chọn coupon (optional)
4. Click nút "Tiền mặt"
5. Nhập địa chỉ giao hàng
6. Xác nhận
7. Xem history tại `/history`

#### 📰 Xem Tin tức
1. Vào `/news` để xem danh sách
2. Click "Đọc tiếp" để xem chi tiết
3. Like tin tức nếu thích
4. Filter theo danh mục
5. Tìm kiếm tin tức

---

### For Admin

#### 💰 Quản lý Coupon
1. Vào `/admin/coupon`
2. Click "Tạo coupon"
3. Nhập thông tin:
   - Code (VD: SAVE50)
   - Loại discount (% hoặc số tiền cố định)
   - Giá trị discount
   - Ngày hết hạn
   - Số lần dùng tối đa
   - Sản phẩm/danh mục áp dụng
4. Click "Tạo"

**Ví dụ:**
```
Code: SUMMER50
Discount Type: percentage
Discount Value: 50
Max Discount: 500,000
Expiry: 2025-08-31
Usage Limit: 100
```

#### 📦 Quản lý Đơn hàng
1. Vào Admin Panel
2. Xem danh sách order
3. Update status:
   - pending → shipping (khi bắt đầu giao)
   - shipping → delivered (khi giao xong)
   - Hoặc cancelled nếu hủy
4. User có thể confirm "delivered"

#### 📰 Quản lý Tin tức

**Tạo Danh mục:**
1. Vào `/admin/news/categories`
2. Click "Tạo danh mục"
3. Nhập tên, mô tả
4. Upload icon/hình ảnh
5. Set thứ tự hiển thị
6. Click "Tạo"

**Tạo Tin tức:**
1. Vào `/admin/news`
2. Click "Tạo tin tức"
3. Nhập thông tin:
   - Tiêu đề
   - Danh mục
   - Tóm tắt
   - Nội dung
   - Hình ảnh
   - Tags
   - Nổi bật (optional)
   - Xuất bản/Nháp
4. Click "Tạo"

---

## 🔗 Routes & URLs

### User Routes
```
/news                      → Danh sách tin tức
/news/:slug               → Chi tiết tin tức
/cart                     → Giỏ hàng (thanh toán tiền mặt)
/history                  → Lịch sử đơn hàng
/history/:id              → Chi tiết đơn hàng
```

### Admin Routes
```
/admin/news               → Quản lý tin tức
/admin/news/categories    → Quản lý danh mục tin tức
/admin/coupon             → Quản lý coupon
/admin/chat-support       → Chat support
```

---

## 💾 Database Models

### Coupon
```javascript
{
    code: String,              // VD: SAVE50
    description: String,
    discountType: String,      // 'percentage' | 'fixed'
    discountValue: Number,
    maxDiscount: Number,
    expiryDate: Date,
    applicableProducts: Array,
    applicableCategories: Array,
    usageLimit: Number,
    usageCount: Number,
    usagePerUser: Number,
    minOrderValue: Number,
    isActive: Boolean,
    usedBy: Array              // Lịch sử dùng
}
```

### News
```javascript
{
    title: String,
    slug: String,
    description: String,
    content: String,
    image: Object,
    category: ObjectId,        // Reference NewsCategory
    author: ObjectId,          // Reference User
    views: Number,             // Auto increment
    likes: Number,
    isPublished: Boolean,
    publishedAt: Date,
    tags: Array,
    isFeatured: Boolean
}
```

### NewsCategory
```javascript
{
    name: String,
    slug: String,
    description: String,
    image: Object,
    isActive: Boolean,
    order: Number
}
```

### Payment (Updated)
```javascript
{
    user_id: String,
    paymentID: String,
    paymentMethod: String,     // 'stripe' | 'cash'
    deliveryStatus: String,    // 'pending' | 'shipping' | 'delivered' | 'cancelled'
    discount: Number,          // NEW
    couponId: ObjectId,        // NEW
    totalAmount: Number,       // NEW
    status: Boolean,           // true: paid
    cart: Array,
    address: Object
}
```

---

## 🧪 Testing

### Test Coupon
```javascript
// 1. Tạo coupon
POST /api/coupon
{
    "code": "TEST50",
    "discountType": "percentage",
    "discountValue": 50,
    "expiryDate": "2025-12-31"
}

// 2. Validate
POST /api/coupon/validate
{
    "code": "TEST50",
    "cart": [...],
    "userId": "user123"
}

// 3. Apply (sau thanh toán)
POST /api/coupon/apply
{
    "couponId": "...",
    "userId": "user123"
}
```

### Test Cash Payment
```javascript
POST /api/cash-payment
{
    "cart": [...],
    "address": "123 Main St",
    "discount": 50000,
    "couponId": "..." // optional
}
```

### Test News
```javascript
// Get all
GET /api/news?page=1&limit=10

// Get by category
GET /api/news/category/khuyen-mai

// Get detail
GET /api/news/tieu-de-tin

// Create
POST /api/news
{
    "title": "...",
    "content": "...",
    "image": {...},
    "category": "..."
}
```

---

## ⚡ Common Issues & Solutions

### Issue: Coupon code bị reject
**Solution:**
- Kiểm tra date hết hạn
- Kiểm tra usage limit
- Kiểm tra cart có sản phẩm áp dụng không
- Kiểm tra tổng tiền >= minOrderValue

### Issue: Payment không lưu discount
**Solution:**
- Kiểm tra discount được pass lên API
- Kiểm tra coupon được apply trước payment
- Kiểm tra database có field discount

### Issue: News không hiển thị
**Solution:**
- Kiểm tra `isPublished: true`
- Kiểm tra category tồn tại
- Kiểm tra image URL hợp lệ

### Issue: Order status không update
**Solution:**
- Kiểm tra auth token
- Kiểm tra user role (admin mới có quyền)
- Kiểm tra paymentId hợp lệ

---

## 📊 Performance Tips

### 1. Pagination
- Luôn sử dụng pagination cho list endpoints
- Default: limit=10 trên backend

### 2. Caching
- Cache danh mục tin tức (ít thay đổi)
- Cache coupon list trên client

### 3. Image Optimization
- Upload hình ảnh với kích thước hợp lý
- Sử dụng CDN nếu có

### 4. Database Indexes
```javascript
// Đã tạo indexes:
// - Coupon: code, expiryDate, isActive
// - News: slug, category, publishedAt
// - NewsCategory: slug, order
```

---

## 🔐 Security Checklist

- ✅ Auth token validation
- ✅ Admin permission check
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB)
- ✅ CORS configured
- ✅ Coupon code validation
- ✅ Payment authenticity

---

## 📱 API Response Format

### Success Response
```javascript
{
    "status": "success",
    "msg": "Success message",
    "data": {...}
}
```

### Error Response
```javascript
{
    "msg": "Error message"
}
```

---

## 🎯 Next Steps

1. Test tất cả endpoints với Postman
2. Kiểm tra UI/UX trên browser
3. Test permission (user vs admin)
4. Test edge cases (coupon hết hạn, quá limit, etc)
5. Deploy lên production

---

## 📞 Developer Support

### Endpoints Documentation
- Chi tiết: `API_REFERENCE.md`
- Setup: `DOCUMENTATION.md`

### Common Commands

```bash
# Backend
npm run dev              # Dev mode
npm start               # Production
npm test                # Run tests

# Frontend
npm start               # Dev server
npm run build           # Build production
npm test                # Run tests
```

---

**Version:** 1.0
**Last Updated:** 2025-11-15
**Status:** Ready for Development ✅
