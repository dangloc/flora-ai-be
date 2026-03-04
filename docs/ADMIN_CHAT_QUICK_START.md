# 🚀 Quick Start - Admin Chat Support

## 📌 3 Bước Nhanh

### 1️⃣ **Hard Refresh Browser**
```bash
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

### 2️⃣ **Login as Admin**
```
URL: http://localhost:3000/login
Email: admin@email.com (hoặc account admin của bạn)
```

### 3️⃣ **Go to Chat Support Page**
```
URL: http://localhost:3000/admin/chat-support
```

---

## 📋 Checklist Trước Khi Test

- [ ] Server đang chạy: `npm start` (terminal 1)
- [ ] Client đang chạy: `cd client && npm start` (terminal 2)
- [ ] MongoDB kết nối
- [ ] User có role = 1 (admin)
- [ ] Socket.IO headers được enable trong server

---

## 🧪 Testing Scenario

### Scenario 1: Gửi tin từ User, Admin nhận

**Bước 1:** Mở 2 tab browser
- Tab 1: Admin chat support page
- Tab 2: User - chat bubble

**Bước 2:** Ở Tab 2 (User)
- Click chat bubble (góc phải dưới)
- Click tab "Chat Admin"
- Chọn admin từ list
- Nhập tin: "Xin chào admin"
- Click Send

**Bước 3:** Ở Tab 1 (Admin)
- Kiểm tra sidebar có user mới
- Click user để xem tin
- Verify tin: "Xin chào admin" hiển thị

✅ **Expected**: Tin nhắn hiển thị ngay lập tức (Socket.IO realtime)

---

### Scenario 2: Admin trả lời, User nhận

**Bước 1:** Tab 1 (Admin)
- Input: "Chúng tôi sẽ giúp bạn"
- Click Send

**Bước 2:** Tab 2 (User)
- Kiểm tra tab "Chat Admin"
- Verify tin nhắn từ admin: "Chúng tôi sẽ giúp bạn"

✅ **Expected**: User nhận tin ngay lập tức

---

## 🔍 Debugging Tips

### Check Console Errors
```javascript
// Browser DevTools → Console
Cmd + Option + J (Mac)
Ctrl + Shift + J (Windows)

// Tìm errors liên quan đến:
// - Socket.IO connection
// - API calls (/api/admin-chats, /api/admin-chat)
// - Component render errors
```

### Check Socket.IO Connection
```javascript
// Browser Console
socket.connected  // true/false
socket.id         // socket ID
socket.emit('test')  // test emit
```

### Check API Responses
```javascript
// DevTools → Network tab
// Filter: XHR
// Check:
// - GET /api/admin-chats/:id → Response
// - GET /api/admin-chat/:userId/:adminId → Response
```

### Check MongoDB Data
```bash
# Terminal - MongoDB shell
mongo
use your_database_name
db.adminchats.find()  // View all admin chats
db.adminchats.findOne()  // View first chat
```

---

## ❌ Common Issues & Solutions

### Issue 1: "Cannot GET /admin/chat-support"
**Cause**: Route không được add  
**Fix**: Check `client/src/components/mainpages/Page.js` - route có import AdminLayout không?

### Issue 2: Admin không nhận tin từ User
**Cause**: Socket.IO event handler lỗi  
**Fix**:
```bash
# Terminal 1: Check server logs
npm start

# Look for:
# ✅ Connected to chat server
# 📩 Received message
```

### Issue 3: Sidebar danh sách trống
**Cause**: API `/api/admin-chats/:id` không return data  
**Fix**:
```javascript
// Check backend response
// GET /api/admin-chats/admin_id
// Should return: { chats: [...] }
```

### Issue 4: Tin nhắn gửi nhưng không lưu DB
**Cause**: Backend không save to MongoDB  
**Fix**:
```bash
# Check MongoDB connection
# Check adminChatModel schema
# Check adminChatRouter POST handler
```

### Issue 5: "Not connected" status
**Cause**: Socket.IO CORS issue  
**Fix**: Check `server.js` Socket.IO config:
```javascript
io(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})
```

---

## 📱 UI Layout Check

### Sidebar Should Show:
- [ ] Admin name + avatar
- [ ] Online status indicator (green dot)
- [ ] Search input
- [ ] Chat list (user name, last message, time)
- [ ] Unread badge

### Main Area Should Show:
- [ ] Chat header (user name + email)
- [ ] Messages (user vs admin)
- [ ] Message time
- [ ] Read receipts (✓✓ for admin messages)
- [ ] Input field + send button

---

## 🔐 User Roles Check

### Admin Account Must Have:
```javascript
{
  _id: ObjectId("..."),
  name: "Admin Name",
  email: "admin@email.com",
  role: 1,        // ← MUST be 1
  isAdmin: true   // ← MUST be true
}
```

### Regular User Account:
```javascript
{
  _id: ObjectId("..."),
  name: "User Name",
  email: "user@email.com",
  role: 0,        // Regular user
  isAdmin: false
}
```

---

## 📊 Expected API Responses

### GET /api/admin-chats/:adminId
```json
{
  "success": true,
  "chats": [
    {
      "_id": "chat_id_123",
      "user_id": {
        "_id": "user_id_456",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "admin_id": "admin_id_789",
      "messages": [
        {
          "_id": "msg_1",
          "sender_type": "user",
          "sender_id": "user_id_456",
          "content": "Hello admin",
          "timestamp": "2024-11-15T10:00:00Z",
          "read": false
        }
      ],
      "status": "active"
    }
  ]
}
```

### GET /api/admin-chat/:userId/:adminId
```json
{
  "success": true,
  "chat": {
    "_id": "chat_id_123",
    "messages": [
      {
        "sender_type": "user",
        "content": "Hello",
        "timestamp": "2024-11-15T10:00:00Z"
      },
      {
        "sender_type": "admin",
        "content": "Hi there!",
        "timestamp": "2024-11-15T10:01:00Z"
      }
    ]
  }
}
```

---

## ✅ Final Checklist Before Deploy

- [ ] All files created successfully
- [ ] No TypeScript/ESLint errors
- [ ] Routes added to Page.js
- [ ] Socket.IO working realtime
- [ ] Messages save to MongoDB
- [ ] Search functionality works
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Read receipts show correctly
- [ ] User and Admin can send/receive messages
- [ ] Sidebar sorts by latest message
- [ ] Auto-scroll to bottom works

---

## 🎉 Ready to Use!

**Now you have:**
1. ✅ User-facing chat (ChatModal.js - Tab 2)
2. ✅ Admin-facing chat support (AdminChatSupport.js)
3. ✅ Realtime Socket.IO integration
4. ✅ MongoDB persistence
5. ✅ Responsive design
6. ✅ Search functionality

**Next Steps (Optional):**
- [ ] Add typing indicators
- [ ] Add read receipts
- [ ] Add file upload
- [ ] Add notifications
- [ ] Add message reactions
- [ ] Add admin groups
- [ ] Deploy to production

---

## 📞 Still Have Issues?

Check these files:
1. **Backend**: `server.js` - Socket.IO events
2. **Model**: `models/adminChatModel.js` - Schema
3. **Routes**: `routes/adminChatRouter.js` - API endpoints
4. **Frontend**: `client/src/components/mainpages/admin/AdminChatSupport.js`

All files are documented with comments. Happy coding! 🚀
