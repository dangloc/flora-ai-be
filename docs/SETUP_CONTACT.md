# Hướng Dẫn Cấu Hình Trang Liên Hệ

## 1. Cài Đặt Dependencies

### Backend
```bash
npm install nodemailer
```

### Client (Đã cài sẵn)
- axios
- sweetalert2

## 2. Cấu Hình Gmail (Email)

### Bước 1: Enable 2-Factor Authentication
1. Đăng nhập vào Google Account: https://myaccount.google.com/
2. Vào **Security** → **2-Step Verification**
3. Bật 2-Step Verification (nếu chưa bật)

### Bước 2: Tạo App Password
1. Quay lại **Security** 
2. Tìm **App Passwords** (chỉ xuất hiện khi bật 2-Step)
3. Chọn **Mail** và **Windows Computer** (hoặc thiết bị của bạn)
4. Google sẽ generate một mật khẩu 16 ký tự
5. Copy mật khẩu này

### Bước 3: Cấu Hình Environment Variables
1. Tạo file `.env` trong thư mục root (nếu chưa có)
2. Thêm các biến sau:

```env
# Email Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
ADMIN_EMAIL=your_gmail@gmail.com
```

**Ví dụ:**
```env
EMAIL_USER=rubiesin2015@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
ADMIN_EMAIL=rubiesin2015@gmail.com
```

## 3. Cấu Hình SMTP Khác (Tuỳ Chọn)

Nếu muốn dùng SMTP khác (Outlook, SendGrid, etc.), sửa file `controllers/contactCtrl.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## 4. Cấu Hình UI (Tuỳ Chọn)

### Thay Đổi Thông Tin Liên Hệ
Mở file `client/src/components/mainpages/contact/Contact.js`

Tìm section này và cập nhật:
```javascript
<div className="info-item">
  <h3>Địa chỉ</h3>
  <p className="info-address">47 - 49 Trần Quang Diệu, Phường 14, Quận 3, TP. HCM</p>
</div>

<div className="info-item">
  <h3>Hotline</h3>
  <p className="info-phone">
    <a href="tel:0703470938">070 347 0938</a>
  </p>
</div>

<div className="info-item">
  <h3>Email</h3>
  <p className="info-email">
    <a href="mailto:rubiesin2015@gmail.com">rubiesin2015@gmail.com</a>
  </p>
</div>
```

### Thay Đổi Google Maps Embed
Sửa URL iframe:
```javascript
<iframe
  src="https://www.google.com/maps/embed?pb=YOUR_EMBED_URL"
  ...
/>
```

Cách lấy Embed URL:
1. Mở Google Maps
2. Tìm kiếm địa chỉ của bạn
3. Click "Share" → "Embed a map"
4. Copy URL từ iframe

## 5. Chạy Ứng Dụng

### Terminal 1 - Backend
```bash
npm run server
# hoặc
npm run dev
```

### Terminal 2 - Frontend (tuỳ chọn)
```bash
cd client
npm start
```

## 6. Kiểm Tra

1. Mở trình duyệt: http://localhost:3000/contact
2. Điền form và click "Gửi thông tin"
3. Kiểm tra email đã nhận

### Email Nhận Được
- **Email Admin**: Nhận thông tin liên hệ từ khách hàng
- **Email Customer**: Nhận xác nhận đã gửi thành công

## 7. Troubleshooting

### Lỗi: "Invalid login credentials"
- Kiểm tra EMAIL_USER và EMAIL_PASSWORD đúng không
- Nếu dùng Gmail, đảm bảo đã tạo App Password (không phải mật khẩu thường)
- Kiểm tra 2-Factor Authentication đã bật

### Lỗi: "Connection timeout"
- Kiểm tra kết nối internet
- Đảm bảo EMAIL_USER đúng định dạng
- Thử disable firewall tạm thời

### Email không gửi được
- Kiểm tra trong file `.env` có tất cả biến cần thiết không
- Xem logs trong terminal backend (`console.error`)
- Kiểm tra "Less secure app access" đã disable trên Gmail

### Form validation
- Tất cả trường phải điền đầy đủ
- Email phải có định dạng hợp lệ
- Số điện thoại phải 10-11 chữ số

## 8. Tính Năng

✅ Form validation đầy đủ
✅ Email confirmation cho khách hàng
✅ Admin notification
✅ Beautiful UI với responsive design
✅ Loading state khi gửi
✅ Sweet alert notifications
✅ Google Maps embed
✅ Breadcrumb navigation

## Files Được Tạo/Sửa

### Client Side
- `client/src/components/mainpages/contact/Contact.js` - Component chính
- `client/src/components/mainpages/contact/contact.css` - Styling
- `client/src/components/mainpages/contact/index.js` - Export
- `client/src/components/mainpages/Page.js` - Thêm route

### Server Side
- `controllers/contactCtrl.js` - Logic xử lý email
- `routes/contactRouter.js` - Routes
- `server.js` - Thêm route vào app

### Config
- `.env.example` - Template biến môi trường
