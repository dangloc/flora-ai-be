# 📚 HƯỚNG DẪN TRIỂN KHAI CHAT REALTIME USER-ADMIN

## 🎯 Tổng Quan

Dự án đã được nâng cấp với **Modal Chat thống nhất** có 2 tab:
1. **Tab "Chat AI"** - Chat với AI tư vấn sản phẩm
2. **Tab "Chat Admin"** - Chat realtime với admin thông qua WebSocket

---

## 📦 Cấu Trúc Files Mới

```
client/src/components/mainpages/chat/
├── ChatModal.js          ← Component chính (2 tab)
├── chatBubble.css        ← CSS cũ (giữ nguyên)
├── chatModal.css         ← CSS mới cho modal thống nhất
└── ChatBubble.js         ← Wrapper (import ChatModal)

controllers/
├── adminChatCtrl.js      ← Controller admin chat (REST API)

routes/
├── adminChatRouter.js    ← Routes admin chat

models/
├── adminChatModel.js     ← Schema chat user-admin

server.js                 ← Cập nhật Socket.IO handlers
```

---

## ⚙️ Cài Đặt Backend

### 1. Cài đặt Dependencies (Server)

```bash
npm install socket.io@^4.8.1
```

### 2. Import Routes trong server.js

Đã cập nhật tự động. Kiểm tra:

```javascript
// server.js - dòng ~40
app.use('/api', require('./routes/adminChatRouter'))
```

### 3. Socket.IO Events (server.js - đã có)

```javascript
// User join
socket.on('user-join', (userId) => { ... })

// Send message (user to admin)
socket.on('send-message', (data) => { ... })

// Admin reply
socket.on('admin-reply', (data) => { ... })

// Disconnect
socket.on('disconnect', () => { ... })
```

---

## 🎨 Cài Đặt Frontend

### 1. Cài đặt Dependencies (Client)

```bash
cd client
npm install socket.io-client@^4.8.1
```

### 2. Import ChatModal

Trong `App.js` hoặc bất cứ đâu cần hiển thị:

```javascript
import ChatBubble from "./components/mainpages/chat/ChatBubble";

function App() {
  return (
    <>
      {/* ... other components ... */}
      <ChatBubble />  {/* Tự động render Modal với 2 tab */}
    </>
  );
}
```

### 3. GlobalState - Thêm User API

`ChatModal.js` sử dụng `state.userAPI.user`:

```javascript
// GlobalState.js - đã có
const state = {
  userAPI: UserAPI(token),  // ✅ Phải có
  chatAPI: ChatAPI(),
}
```

---

## 🔌 REST API Endpoints (Admin Chat)

### Lấy danh sách admin
```
GET /api/admin-list
Response: { admins: [...] }
```

### Lấy danh sách chat của user
```
GET /api/admin-chats/:userId
Response: { chats: [...] }
```

### Lấy lịch sử chat user-admin
```
GET /api/admin-chat/:userId/:adminId
Response: { chat: {...} }
```

### Tạo hoặc lấy chat room
```
POST /api/admin-chat
Body: { user_id, admin_id }
Response: { chat: {...} }
```

### Đóng chat
```
PUT /api/admin-chat/close/:chatId
Response: { msg: "Đã đóng..." }
```

---

## 🔴 WebSocket Events

### Client gửi (Frontend → Backend)

```javascript
// Join chat
socket.emit('user-join', userId);

// Gửi tin nhắn
socket.emit('send-message', {
  user_id: "user_123",
  admin_id: "admin_456",
  message: "Xin chào admin"
});

// Admin trả lời (từ admin panel)
socket.emit('admin-reply', {
  user_id: "user_123",
  admin_id: "admin_456",
  message: "Xin chào! Bạn cần giúp gì?"
});
```

### Server gửi (Backend → Frontend)

```javascript
// Nhận tin nhắn mới
socket.on('receive-message', (data) => {
  // data = {
  //   sender_type: 'user' | 'admin',
  //   message: "...",
  //   timestamp: Date
  // }
});

// Xác nhận gửi thành công
socket.on('message-sent', (data) => {
  // data = { status: 'sent' }
});

// Lỗi
socket.on('message-error', (data) => {
  // data = { error: "..." }
});

// Danh sách user online
socket.on('users-online', (userIds) => {
  // userIds = ['user_1', 'user_2', ...]
});
```

---

## 🎮 Cách Sử Dụng Frontend

### Người dùng
1. Nhấp vào nút chat bubble ✉️ (góc phải dưới)
2. Chọn **Tab "Chat AI"** để chat với AI
3. Chọn **Tab "Chat Admin"** để liên hệ admin
4. Chọn admin từ danh sách
5. Gửi tin nhắn → Chờ phản hồi

### Admin (UI cần xây dựng riêng)
Admin panel cần:
```javascript
// Lắng nghe tin nhắn từ user
socket.on('receive-message', (data) => {
  // Hiển thị tin nhắn
  // Có nút trả lời
  // socket.emit('admin-reply', {...})
});
```

---

## 🚀 Hướng Dẫn Triển Khai Từng Bước

### Step 1: Xóa Cache & Cài Lại Dependencies
```bash
# Server
rm -rf node_modules package-lock.json
npm install

# Client
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Step 2: Khởi Động Server
```bash
npm run server
# hoặc
nodemon server.js
```

### Step 3: Khởi Động Client
```bash
npm run client
# hoặc
cd client && npm start
```

### Step 4: Test Chat
- Truy cập `http://localhost:3000`
- Nhấp nút chat bubble
- Thử chat AI + chat admin
- Kiểm tra console nếu có lỗi

---

## ⚠️ Các Vấn Đề Thường Gặp

### 1. Socket không kết nối
**Lỗi:** `Failed to connect to chat server`

**Giải pháp:**
```javascript
// ChatModal.js - kiểm tra URL
const newSocket = io(
  process.env.REACT_APP_API_URL || "http://localhost:5000"
);
```

**Tạo file `.env.local` (client):**
```env
REACT_APP_API_URL=http://localhost:5000
```

### 2. Lỗi CORS
**Giải pháp:** Đã cấu hình trong `server.js`
```javascript
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
```

### 3. Admin list trống
**Hiện tại:** Mock data có sẵn trong `AdminChatContent`

**Thay đổi thực tế:**
```javascript
// Thêm API call để lấy danh sách admin
useEffect(() => {
  axios.get('/api/admin-list')
    .then(res => setAdminList(res.data.admins))
    .catch(err => console.error(err));
}, []);
```

---

## 🎯 TODO - Phát Triển Thêm

### Phase 1 (Hiện tại)
- ✅ UI Modal 2 tab
- ✅ Socket.IO backend
- ✅ REST API endpoints
- ⏳ **Cần làm:** Admin Panel UI

### Phase 2 (Tùy chọn)
- [ ] Typing indicator
- [ ] Read receipts
- [ ] File upload
- [ ] Message reactions
- [ ] Chat history export
- [ ] Admin dashboard

### Phase 3 (Advanced)
- [ ] Multiple admins chat queue
- [ ] Chat bot auto-response
- [ ] Email notification
- [ ] Mobile app support

---

## 📊 Database Schema

### AdminChat Model
```javascript
{
  user_id: ObjectId,      // Reference to User
  admin_id: ObjectId,     // Reference to User (role: 1)
  messages: [{
    sender_id: ObjectId,
    sender_type: 'user' | 'admin',
    content: String,
    timestamp: Date,
    read: Boolean
  }],
  status: 'active' | 'closed',
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Notes

1. **Xác thực:**
   - Kiểm tra `userId` trước khi lưu message
   - Admin phải được verify (role = 1)

2. **Validation:**
   - Kiểm tra message không rỗng
   - Rate limiting để chống spam

3. **Data Privacy:**
   - Chỉ user + admin đó mới xem được chat
   - Không lưu password/token trong chat

---

## 📞 Support

Nếu có lỗi:
1. Kiểm tra console (F12 → Console)
2. Kiểm tra network (F12 → Network)
3. Kiểm tra server logs
4. Xem MongoDB collections: `adminchat`

---

**Tạo bởi: Copilot Assistant**  
**Ngày: 2025-11-14**
