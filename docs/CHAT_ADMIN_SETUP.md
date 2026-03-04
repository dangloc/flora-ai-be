# 🚀 HƯỚNG DẪN TRIỂN KHAI CHAT ADMIN REALTIME - CHI TIẾT

## 📋 Tóm Tắt Nhanh

| Yếu tố | Chi tiết |
|--------|---------|
| **Công nghệ** | Node.js + Express + Socket.IO + MongoDB |
| **Loại chat** | Realtime WebSocket |
| **Features** | 2 tab (AI + Admin), responsive UI, message history |
| **Thời gian setup** | ~15-20 phút |

---

## ✅ CHECKLIST TRIỂN KHAI

### Backend Setup
- [ ] Cài `socket.io` v4.8.1
- [ ] Tạo file `controllers/adminChatCtrl.js`
- [ ] Tạo file `routes/adminChatRouter.js`
- [ ] Tạo file `models/adminChatModel.js`
- [ ] Cập nhật `server.js` (Socket.IO + routes)
- [ ] Cập nhật `package.json` (socket.io dependency)

### Frontend Setup
- [ ] Cài `socket.io-client` v4.8.1
- [ ] Tạo file `components/mainpages/chat/ChatModal.js`
- [ ] Tạo file `components/mainpages/chat/chatModal.css`
- [ ] Cập nhật `components/mainpages/chat/ChatBubble.js`
- [ ] Tạo file `api/AdminChatAPI.js`
- [ ] Cập nhật `.env.local` (nếu cần)

---

## 📝 HƯỚNG DẪN CHI TIẾT

### BƯỚC 1: Backend - Cài Dependencies

```bash
cd d:\cheat\deploymentShop-main
npm install socket.io@^4.8.1
```

**Kiểm tra:** `package.json` đã có `"socket.io": "^4.8.1"`

---

### BƯỚC 2: Backend - File Models

**File: `models/adminChatModel.js`** (nếu chưa có)

```javascript
const mongoose = require('mongoose');

const adminChatSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sender_type: {
            type: String,
            enum: ['user', 'admin'],
            required: true
        },
        content: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        read: {
            type: Boolean,
            default: false
        }
    }],
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("AdminChat", adminChatSchema);
```

---

### BƯỚC 3: Backend - Controllers

**File: `controllers/adminChatCtrl.js`** (đã có)

Kiểm tra đã tạo:
```bash
ls controllers/adminChatCtrl.js
```

---

### BƯỚC 4: Backend - Routes

**File: `routes/adminChatRouter.js`** (đã có)

Kiểm tra:
```bash
ls routes/adminChatRouter.js
```

---

### BƯỚC 5: Backend - Server Configuration

**Kiểm tra `server.js`:**

```javascript
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);

// ✅ Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// ✅ Socket event handlers (đã có)
io.on('connection', (socket) => { ... });

// ✅ Routes
app.use('/api', require('./routes/adminChatRouter'))

// ✅ Listen
server.listen(PORT, () => { ... })
```

**Kiểm tra:**
```bash
grep -n "socketIO\|socket.io\|server.listen" server.js
```

---

### BƯỚC 6: Frontend - Cài Dependencies

```bash
cd client
npm install socket.io-client@^4.8.1
```

**Kiểm tra:** `client/package.json` có `"socket.io-client": "^4.8.1"`

---

### BƯỚC 7: Frontend - Component Chính

**File: `client/src/components/mainpages/chat/ChatModal.js`**

Đã tạo ✅

---

### BƯỚC 8: Frontend - Styles

**File: `client/src/components/mainpages/chat/chatModal.css`**

Đã tạo ✅

---

### BƯỚC 9: Frontend - Update ChatBubble

**File: `client/src/components/mainpages/chat/ChatBubble.js`**

Nên chứa:
```javascript
import React from "react";
import ChatModal from "./ChatModal";

function ChatBubble() {
  return <ChatModal />;
}

export default ChatBubble;
```

---

### BƯỚC 10: Frontend - API Service

**File: `client/src/api/AdminChatAPI.js`**

Đã tạo ✅

---

### BƯỚC 11: Frontend - Environment

**File: `client/.env.local` (tạo nếu chưa có)**

```env
REACT_APP_API_URL=http://localhost:5000
```

---

### BƯỚC 12: Khởi Động

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

---

## 🧪 TEST CHAT

### Test 1: AI Chat
1. Mở `http://localhost:3000`
2. Nhấp nút chat bubble (góc phải dưới)
3. Chọn tab "Chat AI" ✅
4. Gửi tin nhắn → Kiểm tra AI trả lời

### Test 2: Admin Chat
1. Chọn tab "Chat Admin"
2. Bạn sẽ thấy danh sách admin (mock data)
3. Chọn 1 admin
4. Gửi tin nhắn
5. **Kiểm tra console (F12):**
   - `✅ Connected to chat server`
   - `📩 Received message: ...`

---

## 🐛 TROUBLESHOOTING

### Lỗi 1: Socket không kết nối

**Triệu chứng:**
```
❌ Failed to connect to chat server
Disconnected from chat server
```

**Giải pháp:**
```javascript
// ChatModal.js dòng ~260
const newSocket = io(
  process.env.REACT_APP_API_URL || "http://localhost:5000",
  {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  }
);
```

**Kiểm tra:**
1. Server đã chạy? `npm run server`
2. Port 5000 mở? `netstat -ano | findstr 5000`
3. CORS ok? Kiểm tra `server.js`

---

### Lỗi 2: 404 - Admin routes không tìm thấy

**Triệu chứng:**
```
GET /api/admin-list 404 Not Found
```

**Giải pháp:**
```javascript
// server.js - kiểm tra đã add route?
app.use('/api', require('./routes/adminChatRouter'))
```

**Lệnh kiểm tra:**
```bash
grep -n "adminChatRouter" server.js
```

---

### Lỗi 3: Database lỗi

**Triệu chứng:**
```
Cannot find module 'adminChatModel'
```

**Giải pháp:**
```bash
# Kiểm tra file model
ls models/adminChatModel.js

# Kiểm tra nội dung
head -20 models/adminChatModel.js
```

---

### Lỗi 4: React component error

**Triệu chứng:**
```
Error: Cannot read property '_id' of undefined
```

**Giải pháp:** Kiểm tra `state.userAPI.user` có data

```javascript
// GlobalState.js
userAPI: UserAPI(token)  // Phải có
```

---

## 📊 MONITORING

### Server Logs
```bash
# Khởi động server với verbose logging
DEBUG=* npm run server
```

### Browser Console
```
F12 → Console → Kiểm tra messages
```

### Network Tab
```
F12 → Network → WebSocket → Kiểm tra frame
```

---

## 🔧 CUSTOMIZATION

### Thay đổi Màu Sắc

**File: `chatModal.css`**

```css
/* Thay đổi từ */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Thành màu khác */
background: linear-gradient(135deg, #FF6B6B 0%, #FE5F55 100%);
```

### Thêm Admin List Thực Tế

**File: `ChatModal.js` - dòng ~300**

```javascript
useEffect(() => {
  const fetchAdmins = async () => {
    try {
      const res = await axios.get('/api/admin-list');
      setAdminList(res.data.admins);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };
  fetchAdmins();
}, []);

// Render:
{adminList.map(admin => (
  <div className="admin-item" key={admin._id} onClick={() => setSelectedAdmin(admin)}>
    {/* ... */}
  </div>
))}
```

### Thêm Typing Indicator

```javascript
// Socket event
socket.on('user-typing', (data) => {
  console.log(`${data.userName} đang gõ...`);
  // Hiển thị typing indicator
});

// Emit event
socket.emit('typing', { userId, adminId });
```

---

## 📚 API REFERENCE

### REST Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin-list` | Lấy danh sách admin |
| GET | `/api/admin-chats/:userId` | Lấy danh sách chat của user |
| GET | `/api/admin-chat/:userId/:adminId` | Lấy lịch sử chat |
| POST | `/api/admin-chat` | Tạo/lấy chat room |
| PUT | `/api/admin-chat/close/:chatId` | Đóng chat |

### WebSocket Events

**Client → Server:**
- `user-join` - User join chat
- `send-message` - Gửi tin nhắn
- `admin-reply` - Admin trả lời

**Server → Client:**
- `receive-message` - Nhận tin nhắn
- `message-sent` - Xác nhận gửi
- `message-error` - Lỗi gửi
- `users-online` - Danh sách online

---

## ✨ FEATURES TƯƠNG LAI

### Phase 2
```javascript
// Typing indicator
socket.emit('typing', { userId, adminId });
socket.on('admin-typing', (data) => { ... });

// Read receipts
socket.emit('mark-as-read', { messageId });

// Attachment
socket.emit('send-file', { fileData, type });
```

### Phase 3
```javascript
// Push notifications
if ('Notification' in window) {
  new Notification('Tin nhắn từ admin', {
    body: message.content
  });
}

// Message reactions
socket.emit('react-to-message', { messageId, emoji });

// Voice message
socket.emit('send-voice', { audioBlob });
```

---

## 🚀 DEPLOYMENT

### Production Checklist

```
[ ] Cập nhật MONGODB_URL
[ ] Cập nhật CLIENT_URL
[ ] NODE_ENV=production
[ ] Bật HTTPS (socket.io bắt buộc)
[ ] Rate limiting
[ ] CORS whitelist
[ ] Message encryption
[ ] Database backup
```

### Heroku Deploy

```bash
# 1. Tạo Procfile
echo "web: npm run server" > Procfile

# 2. Deploy
git push heroku main

# 3. Kiểm tra logs
heroku logs --tail
```

---

## 📞 QA

**Q: Có cần Redis không?**
A: Không bắt buộc. Redis cần khi scale multiple servers.

**Q: Nếu server ngừng, tin nhắn mất không?**
A: Không. Tất cả lưu MongoDB. Khi reconnect, lịch sử vẫn hiển thị.

**Q: Message có mã hóa không?**
A: Hiện tại không. Cần thêm SSL + message encryption cho production.

**Q: Có giới hạn số message không?**
A: Không. Nên thêm pagination cho messages cũ.

---

**🎉 Chúc bạn setup thành công!**
