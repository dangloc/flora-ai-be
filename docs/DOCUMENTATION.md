# 📚 Documentation - Hệ thống E-commerce Nâng cập

## Mục lục
1. [Thanh toán Tiền mặt](#thanh-toán-tiền-mặt)
2. [Quản lý Trạng thái Đơn hàng](#quản-lý-trạng-thái-đơn-hàng)
3. [Hệ thống Mã giảm giá (Coupon)](#hệ-thống-mã-giảm-giá)
4. [Hệ thống Tin tức](#hệ-thống-tin-tức)

---

## 🏧 Thanh toán Tiền mặt

### Tổng quan
Thêm phương thức thanh toán tiền mặt khi giao hàng, người dùng có thể chọn thanh toán sau khi nhận hàng.

### Backend Implementation

#### 1. **Payment Model - Cập nhật**
File: `models/paymentModal.js`

```javascript
const paymentSchema = new mongoose.Schema({
    // ... existing fields
    paymentMethod: {
        type: String,
        enum: ['stripe', 'cash'],
        default: 'stripe'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },
    discount: Number,           // Số tiền giảm
    couponId: ObjectId,        // Reference coupon
    totalAmount: Number        // Tổng tiền sau giảm
});
```

#### 2. **Payment Controller - Endpoints**

**POST `/api/cash-payment`** - Tạo đơn hàng thanh toán tiền mặt
```javascript
// Request
{
    cart: [{...}],
    address: "123 Nguyen Hue, HCMC",
    discount: 100000,          // Optional
    couponId: "..."            // Optional
}

// Response
{
    msg: "Cash order created successfully!",
    payment: {
        paymentID: "CASH_1702745355445",
        paymentMethod: "cash",
        status: false,                    // Chưa thanh toán
        deliveryStatus: "pending"
    }
}
```

**PATCH `/api/update-delivery-status`** - Cập nhật trạng thái giao hàng
```javascript
// Request
{
    paymentId: "...",
    deliveryStatus: "shipping"  // 'pending', 'shipping', 'delivered', 'cancelled'
}

// Phân quyền:
// - User: chỉ được update status của chính mình, chỉ có thể mark "delivered"
// - Admin: có thể update bất kỳ đơn hàng, bất kỳ status
```

### Frontend Implementation

#### 1. **Cart Component - Cập nhật**
File: `client/src/components/mainpages/cart/Cart.js`

**Thêm nút thanh toán tiền mặt:**
```jsx
<Button
    type="primary"
    size="large"
    onClick={handleCashPayment}
    style={{
        background: "#10b981",
        borderColor: "#10b981",
        fontWeight: "bold"
    }}
>
    Tiền mặt
</Button>
```

**Flow thanh toán tiền mặt:**
1. User click "Tiền mặt"
2. Hiển thị modal nhập địa chỉ giao hàng
3. Validate input
4. Gửi request POST `/api/cash-payment`
5. Lưu discount + couponId nếu có
6. Tạo payment record với status = false (chưa thanh toán)
7. Redirect tới `/history`

#### 2. **Order History - Hiển thị Status**

**Thêm badge trạng thái giao hàng:**
```jsx
<Tag color={
    deliveryStatus === 'pending' ? 'orange' :
    deliveryStatus === 'shipping' ? 'blue' :
    deliveryStatus === 'delivered' ? 'green' : 'red'
}>
    {translateStatus(deliveryStatus)}
</Tag>
```

**Trạng thái hiển thị:**
- 🟠 **pending** - Chờ giao
- 🔵 **shipping** - Đang giao
- 🟢 **delivered** - Đã giao
- 🔴 **cancelled** - Đã hủy

### API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payment` | Thanh toán Stripe | User |
| POST | `/api/cash-payment` | Thanh toán tiền mặt | User |
| PATCH | `/api/update-delivery-status` | Cập nhật status giao | User/Admin |
| GET | `/api/payment` | Lấy danh sách payment | Admin |

### Database Schema
```javascript
// Payment Document
{
    user_id: ObjectId,
    name: String,
    email: String,
    paymentID: String,
    address: Object,
    cart: Array,
    status: Boolean,              // true: thanh toán thành công
    paymentMethod: String,        // 'stripe' | 'cash'
    deliveryStatus: String,       // 'pending' | 'shipping' | 'delivered' | 'cancelled'
    discount: Number,
    couponId: ObjectId,
    totalAmount: Number,
    createdAt: Date,
    updatedAt: Date
}
```

---

## 📦 Quản lý Trạng thái Đơn hàng

### Tổng quan
Hệ thống theo dõi trạng thái giao hàng cho mỗi đơn hàng, phân biệt quyền user và admin.

### Trạng thái Giao hàng

| Status | Mô tả | User có thể | Admin có thể |
|--------|-------|-----------|-------------|
| **pending** | Chờ xác nhận/giao | ❌ | ✅ |
| **shipping** | Đang giao | ❌ | ✅ |
| **delivered** | Đã giao | ✅ (xác nhận) | ✅ |
| **cancelled** | Đã hủy | ❌ | ✅ |

### Implementation

#### Backend - `paymentCtrl.js`
```javascript
updateDeliveryStatus: async (req, res) => {
    const { paymentId, deliveryStatus } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;  // 0: user, 1: admin

    // Validation
    if (!['pending', 'shipping', 'delivered', 'cancelled'].includes(deliveryStatus)) {
        return res.status(400).json({ msg: "Invalid status" });
    }

    const payment = await Payments.findById(paymentId);
    
    // Phân quyền
    if (userRole !== 1) {  // Not admin
        if (payment.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ msg: "No permission" });
        }
        if (deliveryStatus !== 'delivered') {
            return res.status(403).json({ msg: "Can only confirm delivery" });
        }
    }

    const updated = await Payments.findByIdAndUpdate(
        paymentId,
        { deliveryStatus },
        { new: true }
    );

    res.json({ msg: "Status updated", payment: updated });
};
```

#### Frontend - Update Order History
```javascript
// Cập nhật status từ admin
await axios.patch(
    '/api/update-delivery-status',
    {
        paymentId: orderId,
        deliveryStatus: 'shipping'
    },
    { headers: { Authorization: token } }
);

// User xác nhận đã nhận
await axios.patch(
    '/api/update-delivery-status',
    {
        paymentId: orderId,
        deliveryStatus: 'delivered'
    },
    { headers: { Authorization: token } }
);
```

### UI Components
- ✅ Status badge hiển thị trạng thái hiện tại
- ✅ Timeline hiển thị tiến độ
- ✅ Action button để user xác nhận nhận hàng
- ✅ Admin panel để thay đổi status

---

## 💳 Hệ thống Mã giảm giá (Coupon)

### Tổng quan
Cho phép admin tạo mã giảm giá cho sản phẩm hoặc danh mục, người dùng có thể apply trong giỏ hàng.

### Backend Implementation

#### 1. **Coupon Model**
File: `models/couponModel.js`

```javascript
const couponSchema = {
    code: String,                      // Mã coupon (unique, uppercase)
    description: String,
    discountType: 'percentage' | 'fixed',
    discountValue: Number,             // % hoặc số tiền
    maxDiscount: Number,               // Giới hạn tối đa
    expiryDate: Date,                  // Hạn sử dụng
    startDate: Date,                   // Ngày bắt đầu
    applicableProducts: [ObjectId],    // [] = tất cả sản phẩm
    applicableCategories: [String],    // [] = tất cả danh mục
    usageLimit: Number,                // Số lần dùng tối đa
    usageCount: Number,                // Số lần đã dùng
    usagePerUser: Number,              // Mỗi user dùng tối đa mấy lần
    minOrderValue: Number,             // Giá trị đơn hàng tối thiểu
    isActive: Boolean,
    usedBy: [{                         // Lịch sử dùng
        userId: ObjectId,
        usedAt: Date,
        count: Number
    }]
}
```

#### 2. **Coupon Controller - Endpoints**

**POST `/api/coupon`** - Tạo mã giảm giá (Admin)
```javascript
{
    "code": "SAVE50",
    "description": "Giảm 50% tất cả sản phẩm",
    "discountType": "percentage",
    "discountValue": 50,
    "maxDiscount": 500000,
    "expiryDate": "2025-12-31",
    "applicableProducts": [],
    "applicableCategories": [],
    "usageLimit": 100,
    "usagePerUser": 3,
    "minOrderValue": 100000
}
```

**POST `/api/coupon/validate`** - Validate mã coupon
```javascript
// Request
{
    "code": "SAVE50",
    "cart": [{...}],
    "userId": "..."
}

// Response
{
    "status": "success",
    "coupon": { code, discountType, discountValue, ... },
    "discount": 100000,
    "applicableTotal": 2000000,
    "finalTotal": 1900000
}
```

**POST `/api/coupon/apply`** - Apply coupon (tăng usage)
```javascript
{
    "couponId": "...",
    "userId": "..."
}
```

**PATCH `/api/coupon/:id`** - Cập nhật coupon (Admin)
**DELETE `/api/coupon/:id`** - Xóa coupon (Admin)
**GET `/api/coupon`** - Danh sách coupon
**GET `/api/coupon/:id`** - Chi tiết coupon

#### 3. **Validation Rules**
```
✓ Code unique, uppercase
✓ Discount type: percentage (0-100) hoặc fixed
✓ expiry date > ngày hôm nay
✓ usageLimit >= usageCount
✓ usagePerUser >= user's current usage
✓ Áp dụng cho sản phẩm/danh mục chứa trong giỏ
✓ Tổng tiền >= minOrderValue
✓ Discount <= applicableTotal (với max cap)
```

### Frontend Implementation

#### 1. **Cart Component - Coupon Input**
File: `client/src/components/mainpages/cart/Cart.js`

```jsx
// State
const [couponCode, setCouponCode] = useState("");
const [appliedCoupon, setAppliedCoupon] = useState(null);
const [discount, setDiscount] = useState(0);
const [loadingCoupon, setLoadingCoupon] = useState(false);

// Input & Button
<Input
    placeholder="Nhập mã coupon..."
    value={couponCode}
    onChange={(e) => setCouponCode(e.target.value)}
    onPressEnter={handleValidateCoupon}
/>
<Button onClick={handleValidateCoupon} loading={loadingCoupon}>
    Áp dụng
</Button>

// Display Applied Coupon
{appliedCoupon && (
    <div>
        <p>Mã: {appliedCoupon.code}</p>
        <p>Giảm: {formatCurrency(discount)}</p>
        <Button onClick={handleRemoveCoupon}>Bỏ mã</Button>
    </div>
)}
```

#### 2. **Coupon API - Client**
File: `client/src/api/CouponAPI.js`

```javascript
CouponAPI.validateCoupon(code, cart, userId)  // Validate
CouponAPI.applyCoupon(couponId, userId, token) // Apply
CouponAPI.getCoupons()                          // Danh sách
CouponAPI.createCoupon(data, token)            // Tạo (Admin)
CouponAPI.updateCoupon(id, data, token)        // Sửa (Admin)
CouponAPI.deleteCoupon(id, token)              // Xóa (Admin)
```

#### 3. **Total Calculation**
```javascript
const totalBeforeDiscount = cart.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
);
const finalTotal = totalBeforeDiscount - discount;

// Display
<div>Tạm tính: {formatCurrency(totalBeforeDiscount)}</div>
{discount > 0 && (
    <div>Giảm giá: -{formatCurrency(discount)}</div>
)}
<div>Tổng cộng: {formatCurrency(finalTotal)}</div>
```

### Admin Management

#### Coupon Management Page
- ✅ Danh sách coupon (code, discount, expiry, status)
- ✅ Tạo coupon mới
- ✅ Cập nhật coupon
- ✅ Xóa coupon
- ✅ Filter by status (active/inactive)
- ✅ Hiển thị usage stats

### Use Cases

**Case 1: Percentage Discount**
```
Code: SUMMER50
Discount: 50%
Max Discount: 500,000
Min Order: 100,000
Cart Total: 2,000,000
→ Discount: 500,000 (capped)
→ Final: 1,500,000
```

**Case 2: Fixed Discount**
```
Code: FLAT100K
Discount: 100,000 (fixed)
Cart Total: 500,000
→ Discount: 100,000
→ Final: 400,000
```

**Case 3: Limited Usage**
```
Code: LIMITED
Usage Limit: 100 (tổng)
Usage Per User: 3 (mỗi user)
User A dùng 2 lần, còn 1 lần
User B dùng 0 lần, còn 3 lần
```

---

## 📰 Hệ thống Tin tức (News)

### Tổng quan
Quản lý và hiển thị tin tức cho người dùng, admin có thể tạo, chỉnh sửa, xóa tin tức.

### Backend Implementation

#### 1. **Models**

**NewsCategory Model** - `models/newsCategoryModel.js`
```javascript
{
    name: String,              // Tên danh mục (unique)
    slug: String,              // URL slug (unique, lowercase)
    description: String,
    image: Object,             // Icon/hình đại diện
    isActive: Boolean,
    order: Number              // Thứ tự hiển thị
}
```

**News Model** - `models/newsModel.js`
```javascript
{
    title: String,             // Tiêu đề (required)
    slug: String,              // URL slug (unique)
    description: String,       // Tóm tắt ngắn
    content: String,           // Nội dung chi tiết (required)
    image: Object,             // Hình ảnh đại diện (required)
    category: ObjectId,        // Danh mục (required)
    author: ObjectId,          // Tác giả (reference User)
    views: Number,             // Lượt xem (auto increment)
    likes: Number,             // Lượt thích
    isPublished: Boolean,      // Trạng thái xuất bản
    publishedAt: Date,         // Ngày xuất bản
    tags: [String],            // Từ khóa
    isFeatured: Boolean        // Tin nổi bật
}
```

#### 2. **News Controller - Endpoints**

| Method | Endpoint | Public | Admin | Description |
|--------|----------|--------|-------|-------------|
| GET | `/api/news` | ✅ | - | Danh sách tin (filter, search, page) |
| GET | `/api/news/featured` | ✅ | - | Tin nổi bật |
| GET | `/api/news/trending` | ✅ | - | Tin trending (views cao) |
| GET | `/api/news/category/:slug` | ✅ | - | Tin theo danh mục |
| GET | `/api/news/:slug` | ✅ | - | Chi tiết tin (tăng view) |
| POST | `/api/news/:id/like` | ✅ | - | Like tin |
| POST | `/api/news` | - | ✅ | Tạo tin |
| PATCH | `/api/news/:id` | - | ✅ | Cập nhật tin |
| DELETE | `/api/news/:id` | - | ✅ | Xóa tin |

**GET `/api/news` - Query Parameters**
```javascript
?page=1
&limit=10
&category=categoryId
&search=keyword
&isFeatured=true
```

**POST `/api/news` - Create News (Admin)**
```javascript
{
    "title": "Tiêu đề tin tức",
    "description": "Tóm tắt ngắn",
    "content": "<p>Nội dung HTML</p>",
    "image": { "url": "..." },
    "category": "categoryId",
    "tags": ["tag1", "tag2"],
    "isFeatured": true,
    "isPublished": true
}
```

#### 3. **News Category Controller - Endpoints**

| Method | Endpoint | Public | Admin | Description |
|--------|----------|--------|-------|-------------|
| GET | `/api/news/categories` | ✅ | - | Danh sách danh mục |
| GET | `/api/news/categories/:slug` | ✅ | - | Danh mục theo slug |
| GET | `/api/news/category/:id` | ✅ | - | Chi tiết danh mục |
| POST | `/api/news/categories` | - | ✅ | Tạo danh mục |
| PATCH | `/api/news/categories/:id` | - | ✅ | Cập nhật danh mục |
| DELETE | `/api/news/categories/:id` | - | ✅ | Xóa danh mục |

**POST `/api/news/categories` - Create Category (Admin)**
```javascript
{
    "name": "Khuyến mãi",
    "description": "Mô tả danh mục",
    "image": { "url": "..." },
    "order": 1
}
```

### Frontend Implementation

#### 1. **User Pages**

**NewsList Component** - `client/src/components/mainpages/news/NewsList.js`
- ✅ Hiển thị danh sách tin tức (grid 3 cột)
- ✅ Search tin tức
- ✅ Filter theo danh mục
- ✅ Pagination
- ✅ Like tin
- ✅ Hiển thị: hình, tiêu đề, tóm tắt, lượt xem, like

**NewsDetail Component** - `client/src/components/mainpages/news/NewsDetail.js`
- ✅ Hiển thị nội dung đầy đủ
- ✅ Auto-increment view count
- ✅ Like tin
- ✅ Hiển thị tin liên quan (cùng danh mục)
- ✅ Breadcrumb navigation
- ✅ Meta info (ngày, tác giả, lượt xem)

#### 2. **Admin Pages**

**AdminNews Component** - `client/src/components/mainpages/admin/AdminNews.js`
- ✅ Danh sách tin tức (table)
- ✅ Tạo tin tức (modal form)
- ✅ Cập nhật tin tức
- ✅ Xóa tin tức
- ✅ Upload hình ảnh
- ✅ Form fields: tiêu đề, danh mục, tóm tắt, nội dung, tags, nổi bật, xuất bản

**AdminNewsCategory Component** - `client/src/components/mainpages/admin/AdminNewsCategory.js`
- ✅ Danh sách danh mục (table)
- ✅ Tạo danh mục
- ✅ Cập nhật danh mục
- ✅ Xóa danh mục (check có tin tức)
- ✅ Sắp xếp thứ tự
- ✅ Upload icon

#### 3. **News API - Client**
File: `client/src/api/NewsAPI.js`

```javascript
// User
NewsAPI.getNews(params)               // Danh sách
NewsAPI.getNewsByCategory(slug, params)  // Theo danh mục
NewsAPI.getNewsDetail(slug)           // Chi tiết
NewsAPI.getFeaturedNews(limit)        // Nổi bật
NewsAPI.getTrendingNews(limit, days)  // Trending
NewsAPI.likeNews(id)                  // Like

// Admin
NewsAPI.createNews(data, token)       // Tạo
NewsAPI.updateNews(id, data, token)   // Sửa
NewsAPI.deleteNews(id, token)         // Xóa

// Categories
NewsAPI.getCategories()               // Danh sách
NewsAPI.createCategory(data, token)   // Tạo
NewsAPI.updateCategory(id, data, token) // Sửa
NewsAPI.deleteCategory(id, token)     // Xóa
```

### Routes

```javascript
// User Routes
GET  /news              → NewsList
GET  /news/:slug        → NewsDetail

// Admin Routes
GET  /admin/news        → AdminNews
GET  /admin/news/categories → AdminNewsCategory
```

### Features

**Cho User:**
- ✅ Xem danh sách tin tức
- ✅ Tìm kiếm tin
- ✅ Filter theo danh mục
- ✅ Phân trang
- ✅ Xem chi tiết tin
- ✅ Lượt xem tự động tăng
- ✅ Like tin
- ✅ Xem tin liên quan

**Cho Admin:**
- ✅ Tạo/Sửa/Xóa tin
- ✅ Upload hình ảnh
- ✅ Đặt tin nổi bật
- ✅ Xuất bản/Nháp
- ✅ Thêm tags
- ✅ Quản lý danh mục
- ✅ Sắp xếp danh mục

### Use Cases

**Case 1: User xem tin tức**
1. Vào `/news` → NewsList
2. Filter by danh mục hoặc search
3. Click "Đọc tiếp" → NewsDetail
4. View count tự động +1
5. Like tin (nếu muốn)

**Case 2: Admin tạo tin**
1. Vào `/admin/news` → AdminNews
2. Click "Tạo tin tức"
3. Fill form (tiêu đề, danh mục, nội dung, hình ảnh)
4. Set nổi bật + xuất bản
5. Click "Tạo"

**Case 3: Quản lý danh mục**
1. Vào `/admin/news/categories`
2. Tạo/Sửa/Xóa danh mục
3. Upload icon
4. Sắp xếp thứ tự

---

## 📊 Database Changes Summary

### Models Thêm
- ✅ `Coupon` - Mã giảm giá
- ✅ `NewsCategory` - Danh mục tin tức
- ✅ `News` - Tin tức

### Models Cập nhật
- ✅ `Payments` - Thêm: discount, couponId, totalAmount, deliveryStatus

### Collections
```
deploymentShop
├── coupons
├── newscategories
├── news
└── payments (updated)
```

---

## 🔐 Security & Validation

### Coupon
- ✅ Check code unique
- ✅ Validate expiry date
- ✅ Check usage limit
- ✅ Check usage per user
- ✅ Validate discount range (0-100 for %)
- ✅ Check applicable products/categories

### News
- ✅ Slug auto-generate từ title
- ✅ Check duplicate slug
- ✅ Image required
- ✅ Category must exist
- ✅ Author tracking

### Payment (Cash)
- ✅ User xác thực
- ✅ Cart không trống
- ✅ Address bắt buộc
- ✅ Coupon valid check

---

## 🚀 Deployment Notes

### Environment Variables
Không cần thêm env mới - sử dụng existing setup

### Database Indexes
- Coupon: code, expiryDate, isActive
- News: slug, category, publishedAt, isFeatured
- NewsCategory: slug, isActive, order

### API Endpoints Summary
**Total: 35+ endpoints**

```
Coupon:          8 endpoints
News:           10 endpoints
News Category:   6 endpoints
Payment:         3 endpoints (thêm cash payment + status update)
```

---

## 📝 Testing Checklist

- [ ] Coupon create/update/delete
- [ ] Coupon validate & apply
- [ ] Cash payment flow
- [ ] Delivery status update
- [ ] News CRUD operations
- [ ] News category CRUD
- [ ] Search & filter news
- [ ] Like & view count
- [ ] Image upload
- [ ] Permission checks

---

## 📞 Support

Nếu có vấn đề:
1. Check server logs
2. Verify MongoDB connection
3. Check auth token
4. Test API endpoints với Postman
5. Check browser console errors

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Status:** Production Ready ✅
