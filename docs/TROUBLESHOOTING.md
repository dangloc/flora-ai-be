# 🔧 Troubleshooting Guide

## Upload Hình ảnh - Lỗi 400

### Vấn đề
Khi upload hình ảnh trong tạo tin tức hoặc danh mục, nhận lỗi `400 Bad Request`

### Nguyên nhân
Upload component không gửi Authorization token, khiến request bị reject bởi middleware `auth` và `authAdmin`

### Giải pháp ✅

#### 1. **Frontend - Thêm Authorization Header**

File: `client/src/components/mainpages/admin/AdminNews.js`

```jsx
<Upload
    action="/api/upload"
    name="file"
    onChange={handleImageUpload}
    maxCount={1}
    accept="image/*"
    headers={{
        Authorization: token  // ← Thêm dòng này
    }}
>
    <Button>Chọn hình ảnh</Button>
</Upload>
```

File: `client/src/components/mainpages/admin/AdminNewsCategory.js`

```jsx
<Upload
    action="/api/upload"
    name="file"
    onChange={handleImageUpload}
    maxCount={1}
    accept="image/*"
    headers={{
        Authorization: token  // ← Thêm dòng này
    }}
>
    <Button>Chọn hình ảnh</Button>
</Upload>
```

#### 2. **Frontend - Cập nhật Error Handler**

Thêm hàm này để hiện error message chi tiết:

```javascript
const handleImageUpload = (info) => {
    if (info.file.status === "done") {
        const response = info.file.response;
        if (response?.url) {
            setImagePreview(response.url);
            message.success("Upload hình ảnh thành công!");
        } else if (response?.msg) {
            message.error(response.msg || "Upload thất bại!");
        }
    } else if (info.file.status === "error") {
        const errorMsg = info.file.response?.msg || "Upload hình ảnh thất bại!";
        message.error(errorMsg);
    }
};
```

### Backend - Upload Endpoint

Endpoint: `POST /api/upload`

**Yêu cầu:**
- Authorization header phải có (token từ login)
- User phải là admin
- File phải là image (JPG, PNG, WebP)
- File size <= 1MB
- Cloudinary credentials phải valid

**File upload.js - Cấu hình:**
```javascript
router.post("/upload", auth, authAdmin, (req, res) => {
    // Kiểm tra file tồn tại
    if (!req.files || Object.keys(req.files).length === 0)
        return res.status(404).json({ msg: "Không có file nào." });

    // Kiểm tra file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
            msg: "File không đúng định dạng (JPG, PNG, WebP)" 
        });
    }

    // Kiểm tra file size (max 1MB)
    if (file.size > 1024 * 1024) {
        return res.status(400).json({ 
            msg: "File không được lớn hơn 1MB" 
        });
    }
});
```

---

## Các Lỗi Upload Phổ Biến

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-----------|---------|
| **400 Bad Request** | Token không được gửi | Thêm `headers={{ Authorization: token }}` |
| **401 Unauthorized** | Token không hợp lệ/hết hạn | Re-login |
| **403 Forbidden** | User không phải admin | Kiểm tra `isAdmin` flag |
| **404 Not Found** | File trống | Chọn file hợp lệ |
| **400 File type** | JPG/PNG/WebP required | Chọn file ảnh đúng định dạng |
| **400 File size** | File > 1MB | Compress ảnh |
| **500 Internal** | Cloudinary error | Kiểm tra CLOUD_NAME, API_KEY, API_SECRET |

---

## Kiểm tra Cloudinary Configuration

File: `.env`

```env
# Cloudinary
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
```

**Cách lấy:**
1. Vào https://cloudinary.com
2. Đăng nhập dashboard
3. Copy `Cloud Name`, `API Key`, `API Secret`
4. Paste vào `.env`

---

## Test Upload từ Postman

### 1. Get Token
```
POST /api/auth/login
Body: 
{
    "email": "admin@gmail.com",
    "password": "admin123"
}
Copy token từ response
```

### 2. Upload File
```
POST http://localhost:5000/api/upload

Headers:
- Authorization: <token từ step 1>

Body (form-data):
- file: <chọn ảnh từ máy>

Expected Response:
{
    "public_id": "uploader/xyz123",
    "url": "https://res.cloudinary.com/..."
}
```

---

## Upload không cần Admin

Nếu muốn cho phép user thường tải lên, thay đổi route:

```javascript
// Từ: auth + authAdmin
router.post("/upload", auth, authAdmin, (req, res) => {

// Thành: chỉ auth
router.post("/upload", auth, (req, res) => {
```

---

## Debug Logs

Thêm logs để debug:

### Frontend (AdminNews.js)
```javascript
const handleImageUpload = (info) => {
    console.log("Upload status:", info.file.status);
    console.log("File response:", info.file.response);
    console.log("File error:", info.file.error);
    
    if (info.file.status === "done") {
        // ...
    }
};
```

### Backend (upload.js)
```javascript
router.post("/upload", auth, authAdmin, (req, res) => {
    console.log("User:", req.user);
    console.log("Files:", req.files);
    console.log("File size:", req.files?.file?.size);
    console.log("File mimetype:", req.files?.file?.mimetype);
    // ...
});
```

---

## Performance Tips

### 1. Compress Image Before Upload
```javascript
// Dùng library: react-image-crop hoặc browser-image-compression

import imageCompression from 'browser-image-compression';

const handleImageBefore = async (file) => {
    const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true
    };
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
};
```

### 2. Show Progress Bar
```javascript
const handleImageUpload = (info) => {
    const percent = info.file.percent || 0;
    console.log(`Upload ${percent}%`);
};
```

### 3. Use webp Format
```jsx
<Upload accept="image/webp" ... />
```

---

## Common Backend Issues

### Lỗi: "CLOUD_NAME is undefined"
**Giải pháp:**
```javascript
// Kiểm tra .env file tồn tại
// Kiểm tra server được khởi động sau khi cập nhật .env
// Restart server sau khi thêm .env
```

### Lỗi: "auth is not a function"
**Giải pháp:**
```javascript
// Kiểm tra middleware/auth.js tồn tại
// Kiểm tra import path đúng
const auth = require("../middleware/auth");
```

### Lỗi: "Cannot read property 'file' of undefined"
**Giải pháp:**
```javascript
// Kiểm tra express-fileupload được install
// npm install express-fileupload

// Kiểm tra server.js có cấu hình
app.use(fileUpload({useTempFiles: true}));
```

---

## Recommended Image Sizes

| Đối với | Kích thước | Format |
|--------|----------|--------|
| Tin tức | 1200x630 | JPG/WebP |
| Category | 200x200 | PNG/WebP |
| Admin banner | 1920x600 | JPG/WebP |
| Thumbnail | 400x300 | JPG/WebP |

---

## File Upload Workflow

```
1. User chọn file
   ↓
2. Frontend validate (size, type)
   ↓
3. Thêm Authorization header
   ↓
4. POST /api/upload
   ↓
5. Backend kiểm tra auth (auth middleware)
   ↓
6. Backend kiểm tra admin (authAdmin middleware)
   ↓
7. Backend kiểm tra file (format, size)
   ↓
8. Upload lên Cloudinary
   ↓
9. Return URL
   ↓
10. Frontend hiển thị preview
    ↓
11. Submit form (URL được lưu vào DB)
```

---

## Quick Fix Checklist

- [ ] Kiểm tra token được gửi trong request
- [ ] Kiểm tra user là admin
- [ ] Kiểm tra ảnh <= 1MB
- [ ] Kiểm tra định dạng: JPG/PNG/WebP
- [ ] Kiểm tra Cloudinary credentials
- [ ] Kiểm tra express-fileupload được install
- [ ] Restart server sau khi cập nhật
- [ ] Kiểm tra console errors (F12)

---

## Support

Nếu upload vẫn lỗi:

1. **Check browser console** (F12 → Network → Upload request)
2. **Check server logs** (`npm run dev` output)
3. **Test với Postman** (see section trên)
4. **Re-login** (token có thể hết hạn)
5. **Restart server** (`npm start` hoặc `npm run dev`)

---

**Status:** ✅ Updated - Authorization header fixed
**Last Updated:** 2025-11-15
