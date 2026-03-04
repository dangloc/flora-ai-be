# API Reference - E-commerce System

## Base URL
```
http://localhost:5000
```

## Authentication
```
Header: Authorization: {token}
```

---

## 💳 Coupon APIs

### List All Coupons
```
GET /api/coupon
Query: ?isActive=true

Response:
{
    "status": "success",
    "result": 10,
    "coupons": [
        {
            "_id": "...",
            "code": "SAVE50",
            "description": "50% off",
            "discountType": "percentage",
            "discountValue": 50,
            "expiryDate": "2025-12-31",
            "usageLimit": 100,
            "usageCount": 45,
            "isActive": true
        }
    ]
}
```

### Create Coupon (Admin)
```
POST /api/coupon
Auth: Required (Admin)

Body:
{
    "code": "SUMMER50",
    "description": "Summer discount 50%",
    "discountType": "percentage",
    "discountValue": 50,
    "maxDiscount": 500000,
    "expiryDate": "2025-08-31",
    "applicableProducts": [],
    "applicableCategories": [],
    "usageLimit": 100,
    "usagePerUser": 3,
    "minOrderValue": 100000
}

Response:
{
    "msg": "Tạo coupon thành công",
    "coupon": {...}
}
```

### Validate Coupon
```
POST /api/coupon/validate
Auth: Not Required

Body:
{
    "code": "SAVE50",
    "cart": [
        {
            "_id": "...",
            "title": "Product 1",
            "price": 100000,
            "quantity": 2,
            "category": "electronics"
        }
    ],
    "userId": "user123"
}

Response:
{
    "status": "success",
    "msg": "Coupon hợp lệ",
    "coupon": {
        "_id": "...",
        "code": "SAVE50",
        "discountType": "percentage",
        "discountValue": 50,
        "maxDiscount": 500000
    },
    "discount": 100000,
    "applicableTotal": 200000,
    "finalTotal": 100000
}

Error Response (400):
{
    "msg": "Coupon này đã hết hạn"
}
```

### Apply Coupon
```
POST /api/coupon/apply
Auth: Required

Body:
{
    "couponId": "...",
    "userId": "..."
}

Response:
{
    "msg": "Áp dụng coupon thành công",
    "coupon": {...}
}
```

### Update Coupon (Admin)
```
PATCH /api/coupon/:id
Auth: Required (Admin)

Body: (Same as Create, partial update)

Response:
{
    "msg": "Cập nhật coupon thành công",
    "coupon": {...}
}
```

### Delete Coupon (Admin)
```
DELETE /api/coupon/:id
Auth: Required (Admin)

Response:
{
    "msg": "Xóa coupon thành công"
}
```

---

## 📦 Payment APIs

### Create Stripe Payment
```
POST /api/payment
Auth: Required

Body:
{
    "lineItems": [
        {
            "price_data": {
                "currency": "vnd",
                "product_data": {
                    "name": "Product Name",
                    "images": ["https://..."]
                },
                "unit_amount": 100000
            },
            "quantity": 2
        }
    ],
    "discount": 0
}

Response:
{
    "id": "cs_test_...",
    "url": "https://checkout.stripe.com/..."
}
```

### Create Cash Payment
```
POST /api/cash-payment
Auth: Required

Body:
{
    "cart": [
        {
            "_id": "...",
            "title": "Product",
            "price": 100000,
            "quantity": 1
        }
    ],
    "address": "123 Nguyen Hue, HCMC",
    "discount": 50000,
    "couponId": "..." (optional)
}

Response:
{
    "msg": "Cash order created successfully!",
    "payment": {
        "_id": "...",
        "paymentID": "CASH_1702745355445",
        "paymentMethod": "cash",
        "status": false,
        "deliveryStatus": "pending"
    }
}
```

### Get Payments (Admin)
```
GET /api/payment
Auth: Required (Admin)

Response:
{
    "status": "success",
    "payments": [...]
}
```

### Retrieve Stripe Session
```
GET /api/success/:id
Auth: Required

Response:
{
    "id": "cs_test_...",
    "payment_status": "paid",
    "status": "complete"
}
```

### Update Payment Status (After Stripe Success)
```
POST /api/update-payment
Auth: Required

Body:
{
    "cart": [...],
    "paymentID": "pi_...",
    "address": "...",
    "status": true,
    "discount": 0,
    "couponId": "..."
}

Response:
{
    "msg": "Payment Success!"
}
```

### Update Delivery Status
```
PATCH /api/update-delivery-status
Auth: Required

Body:
{
    "paymentId": "...",
    "deliveryStatus": "shipping"
}

Valid Status:
- "pending": Chờ giao
- "shipping": Đang giao
- "delivered": Đã giao
- "cancelled": Đã hủy

Permissions:
- User: Chỉ update "delivered" cho đơn của mình
- Admin: Update bất kỳ status

Response:
{
    "msg": "Delivery status updated",
    "payment": {
        "deliveryStatus": "shipping"
    }
}
```

---

## 📰 News APIs

### Get All News
```
GET /api/news
Query:
    ?page=1
    &limit=10
    &category=categoryId (optional)
    &search=keyword (optional)
    &isFeatured=true (optional)

Response:
{
    "status": "success",
    "result": 10,
    "total": 150,
    "page": 1,
    "pages": 15,
    "news": [
        {
            "_id": "...",
            "title": "News Title",
            "slug": "news-title",
            "description": "Short summary",
            "image": { "url": "..." },
            "category": { "name": "Category", "slug": "..." },
            "views": 123,
            "likes": 45,
            "isFeatured": true,
            "isPublished": true
        }
    ]
}
```

### Get Featured News
```
GET /api/news/featured
Query: ?limit=5

Response: (Same structure as above)
```

### Get Trending News
```
GET /api/news/trending
Query:
    ?limit=10
    &days=7

Response: (Same structure, sorted by views desc)
```

### Get News by Category
```
GET /api/news/category/:slug
Query:
    ?page=1
    &limit=10

Response:
{
    "status": "success",
    "result": 10,
    "total": 50,
    "category": {
        "_id": "...",
        "name": "Khuyến mãi",
        "slug": "khuyen-mai"
    },
    "news": [...]
}
```

### Get News Detail
```
GET /api/news/:slug
Auth: Not Required
(Auto increment views)

Response:
{
    "status": "success",
    "news": {
        "_id": "...",
        "title": "News Title",
        "content": "<p>Full content...</p>",
        "description": "Summary",
        "image": { "url": "..." },
        "category": { "_id": "...", "name": "..." },
        "author": { "_id": "...", "name": "..." },
        "views": 124,
        "likes": 45,
        "tags": ["tag1", "tag2"],
        "isFeatured": true,
        "publishedAt": "2025-11-15"
    }
}
```

### Like News
```
POST /api/news/:id/like
Auth: Not Required

Response:
{
    "msg": "Like thành công",
    "likes": 46
}
```

### Create News (Admin)
```
POST /api/news
Auth: Required (Admin)

Body:
{
    "title": "News Title",
    "description": "Short summary",
    "content": "<p>Full HTML content</p>",
    "image": { "url": "https://..." },
    "category": "categoryId",
    "tags": ["tag1", "tag2"],
    "isFeatured": true,
    "isPublished": true
}

Response:
{
    "msg": "Tạo tin tức thành công",
    "news": {...}
}
```

### Update News (Admin)
```
PATCH /api/news/:id
Auth: Required (Admin)

Body: (Same as Create, partial update)

Response:
{
    "msg": "Cập nhật tin tức thành công",
    "news": {...}
}
```

### Delete News (Admin)
```
DELETE /api/news/:id
Auth: Required (Admin)

Response:
{
    "msg": "Xóa tin tức thành công"
}
```

---

## 🏷️ News Category APIs

### Get All Categories
```
GET /api/news/categories
Query: ?isActive=true (optional)

Response:
{
    "status": "success",
    "result": 5,
    "categories": [
        {
            "_id": "...",
            "name": "Khuyến mãi",
            "slug": "khuyen-mai",
            "description": "...",
            "image": { "url": "..." },
            "order": 1,
            "isActive": true
        }
    ]
}
```

### Get Category by Slug
```
GET /api/news/categories/:slug

Response:
{
    "status": "success",
    "category": {...}
}
```

### Get Category by ID
```
GET /api/news/category/:id

Response:
{
    "status": "success",
    "category": {...}
}
```

### Create Category (Admin)
```
POST /api/news/categories
Auth: Required (Admin)

Body:
{
    "name": "Khuyến mãi",
    "description": "Các tin về khuyến mãi",
    "image": { "url": "https://..." },
    "order": 1
}

Response:
{
    "msg": "Tạo danh mục thành công",
    "category": {...}
}
```

### Update Category (Admin)
```
PATCH /api/news/categories/:id
Auth: Required (Admin)

Body: (Same as Create, partial update)

Response:
{
    "msg": "Cập nhật danh mục thành công",
    "category": {...}
}
```

### Delete Category (Admin)
```
DELETE /api/news/categories/:id
Auth: Required (Admin)

Response:
{
    "msg": "Xóa danh mục thành công"
}

Error (400):
{
    "msg": "Không thể xóa danh mục có 5 tin tức. Vui lòng xóa hoặc chuyển các tin tức trước."
}
```

---

## Error Responses

### 400 Bad Request
```
{
    "msg": "Vui lòng cung cấp đầy đủ thông tin"
}
```

### 401 Unauthorized
```
{
    "msg": "Token is invalid or expired"
}
```

### 403 Forbidden
```
{
    "msg": "You don't have permission"
}
```

### 404 Not Found
```
{
    "msg": "Không tìm thấy tài nguyên"
}
```

### 500 Server Error
```
{
    "msg": "Internal server error message"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

---

## Pagination

All list endpoints support pagination:

```
Query Parameters:
- page: Trang hiện tại (default: 1)
- limit: Số item per trang (default: 10)

Response:
{
    "result": 10,           // Số items trong trang
    "total": 150,          // Tổng số items
    "page": 1,             // Trang hiện tại
    "pages": 15            // Tổng số trang
}
```

---

## Search & Filter

### News Search
```
GET /api/news?search=keyword

- Tìm kiếm trong title và content
- Case-insensitive
```

### News Filter
```
GET /api/news?category=categoryId&isFeatured=true

- category: Lọc theo danh mục
- isFeatured: Chỉ lấy tin nổi bật
```

---

## Sorting

### News Sorting
```
Default: sort by publishedAt desc (mới nhất trước)

News List:
- Sắp xếp theo publishedAt (-1 = desc)

Trending:
- Sắp xếp theo views desc

Category List:
- Sắp xếp theo order asc
```

---

## Rate Limiting

Hiện tại không có rate limit, nhưng có thể thêm sau:

```
Recommended:
- 100 requests per minute for public endpoints
- 10 requests per minute for create/update/delete
```

---

## Testing with Postman

### 1. Create Collection
- New → Collection → "E-commerce APIs"

### 2. Set Environment Variables
```
{
    "base_url": "http://localhost:5000",
    "token": "your-auth-token",
    "userId": "your-user-id"
}
```

### 3. Test Endpoints
```
Use {{base_url}}/api/news for base URL
Use {{token}} for Authorization header
```

---

**API Version:** 1.0
**Last Updated:** 2025-11-15
