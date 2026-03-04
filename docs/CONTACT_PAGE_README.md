# Contact Page - Trang Liên Hệ

## 📋 Mô Tả

Trang liên hệ hoàn chỉnh với các tính năng:
- ✅ Form liên hệ với validation đầy đủ
- ✅ Gửi email tự động bằng Nodemailer (Gmail SMTP)
- ✅ Email xác nhận gửi cho khách hàng
- ✅ Email thông báo cho admin
- ✅ Lưu trữ tin nhắn trong database MongoDB
- ✅ Admin panel để quản lý tin nhắn
- ✅ Google Maps embed
- ✅ Responsive design
- ✅ SweetAlert notifications

## 🚀 Quick Start

### 1. Cài đặt Nodemailer
```bash
cd d:\cheat\deploymentShop-main
npm install nodemailer
```

### 2. Cấu hình Email

**Với Gmail:**

1. Đăng nhập Google Account
2. Bật 2-Factor Authentication
3. Tạo App Password
4. Tạo file `.env` với:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
ADMIN_EMAIL=your_email@gmail.com
```

**Với Email khác:**

Sửa file `controllers/contactCtrl.js`:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.provider.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### 3. Chạy ứng dụng
```bash
npm run dev
```

### 4. Truy cập trang
```
http://localhost:3000/contact
```

## 📁 Files Được Tạo

### Client Side
```
client/src/components/mainpages/contact/
├── Contact.js           # Component chính
├── contact.css          # Styling
└── index.js            # Export
```

### Server Side
```
├── controllers/contactCtrl.js      # Logic xử lý
├── routes/contactRouter.js         # Routes
├── models/contactModel.js          # Schema MongoDB
└── server.js                       # Thêm route (đã cập nhật)
```

### Configuration
```
├── .env.example              # Template biến môi trường
└── SETUP_CONTACT.md         # Hướng dẫn chi tiết
```

## 🎨 UI Features

### Left Section
- Thông tin liên hệ (địa chỉ, hotline, email)
- Contact form với các trường:
  - Họ và tên
  - Email
  - Điện thoại
  - Chủ đề
  - Nội dung

### Right Section
- Google Maps embed hiển thị địa chỉ cửa hàng

### Responsive
- Desktop: 2 cột
- Tablet: 2 cột nhưng sát gọn hơn
- Mobile: 1 cột

## 🔧 API Endpoints

### Public
```
POST /api/contact/send-mail
Body: {
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
}
```

### Admin Only
```
GET /api/contact/all
PATCH /api/contact/:id/read
DELETE /api/contact/:id
```

## 📧 Email Templates

### 1. Email tới Admin
- Thông tin khách hàng
- Nội dung tin nhắn
- Thời gian gửi
- Reply-To: email khách hàng

### 2. Email tới Khách Hàng
- Xác nhận nhận được tin nhắn
- Thông tin liên hệ admin
- Lời hẹn hò liên hệ lại

## 🗄️ Database Schema

```javascript
{
  name: String,           // Tên khách hàng
  email: String,         // Email khách hàng
  phone: String,         // Số điện thoại
  subject: String,       // Chủ đề
  message: String,       // Nội dung tin nhắn
  status: String,        // new | read | replied
  createdAt: Date,       // Thời gian tạo
  updatedAt: Date        // Thời gian cập nhật
}
```

## ⚙️ Customization

### Thay đổi thông tin liên hệ
```javascript
// Contact.js - dòng 65-80
<p className="info-address">47 - 49 Trần Quang Diệu, Phường 14, Quận 3, TP. HCM</p>
<a href="tel:0703470938">070 347 0938</a>
<a href="mailto:rubiesin2015@gmail.com">rubiesin2015@gmail.com</a>
```

### Thay đổi màu sắc
```css
/* contact.css */
--primary-color: #ff6b6b;  /* Màu đỏ
--text-dark: #000;          /* Màu chữ
--text-light: #666;         /* Màu chữ nhạt
```

### Thay đổi Google Maps
Lấy link embed từ Google Maps Share → Embed a map

## 🐛 Troubleshooting

### Email không gửi được
1. Kiểm tra `.env` có các biến cần thiết
2. Kiểm tra EMAIL_PASSWORD là App Password (Gmail)
3. Kiểm tra kết nối internet
4. Xem console.error trong terminal

### Form validation không hoạt động
- Tất cả trường phải có giá trị
- Email phải có định dạng hợp lệ
- Phone phải 10-11 chữ số

### CORS errors
- Đảm bảo backend chạy trên port 5000
- Frontend chạy trên port 3000
- CORS đã được enable trong server.js

## 📱 Browser Support
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅

## 🔐 Security

- ✅ Email validation
- ✅ Phone validation
- ✅ Input sanitization
- ✅ Admin authentication cho API admin
- ✅ Environment variables cho sensitive data
- ✅ HTTPS ready

## 📚 Dependencies

```json
{
  "nodemailer": "^6.9.0",    // Backend: Gửi email
  "axios": "^1.6.2",         // Frontend: HTTP requests
  "sweetalert2": "^11.10.1"  // Frontend: Beautiful alerts
}
```

## 🎯 Next Steps

1. ✅ Cài đặt Nodemailer
2. ✅ Cấu hình Email
3. ✅ Chạy ứng dụng
4. ✅ Kiểm tra trang contact
5. ✅ Gửi thử tin nhắn test
6. ✅ Kiểm tra email đã nhận
7. ✅ Customize theo branding

## 📞 Support

Nếu gặp lỗi:
1. Kiểm tra file SETUP_CONTACT.md
2. Xem console.log/error
3. Kiểm tra network tab trong DevTools
4. Kiểm tra database MongoDB

## 📄 License

MIT License - Tự do sử dụng cho mục đích thương mại hoặc không
