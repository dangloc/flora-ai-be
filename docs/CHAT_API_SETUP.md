# Hướng dẫn Setup API Chat Tư Vấn với Google Gemini

## 1. Cài đặt Package

Chạy lệnh sau để cài đặt Google Generative AI SDK:

```bash
npm install @google/generative-ai
```

## 2. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Lấy Gemini API Key:

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng tài khoản Google
3. Tạo API key mới
4. Copy và paste vào file `.env`

## 3. API Endpoints

### 3.1. Tạo Session Chat Mới
```
POST /api/chat/session
```

Response:
```json
{
  "status": "success",
  "session_id": "session_1234567890_abc123",
  "msg": "Tạo phiên chat mới thành công"
}
```

### 3.2. Chat với AI
```
POST /api/chat
Content-Type: application/json

{
  "message": "Tôi muốn mua áo thun nam",
  "session_id": "session_1234567890_abc123" // Optional
}
```

Response:
```json
{
  "status": "success",
  "message": "Chào bạn! Tôi có thể tư vấn cho bạn về áo thun nam...",
  "session_id": "session_1234567890_abc123"
}
```

### 3.3. Lấy Lịch Sử Chat
```
GET /api/chat/history/:session_id
```

Response:
```json
{
  "status": "success",
  "messages": [
    {
      "role": "user",
      "content": "Tôi muốn mua áo thun nam",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Chào bạn! Tôi có thể tư vấn...",
      "timestamp": "2024-01-01T00:00:01.000Z"
    }
  ],
  "session_id": "session_1234567890_abc123"
}
```

### 3.4. Xóa Lịch Sử Chat
```
DELETE /api/chat/history/:session_id
```

Response:
```json
{
  "msg": "Xóa lịch sử chat thành công"
}
```

## 4. Tính Năng

- ✅ Tư vấn sản phẩm thời trang dựa trên database
- ✅ Lưu lịch sử chat theo session
- ✅ Context-aware: AI biết về sản phẩm hiện có
- ✅ Tư vấn về size, màu sắc, phong cách
- ✅ Đề xuất mix & match, phối đồ
- ✅ Trả lời bằng tiếng Việt, tự nhiên

## 5. Ví Dụ Sử Dụng

### Frontend (React/JavaScript):

```javascript
// Tạo session mới
const createSession = async () => {
  const res = await fetch('/api/chat/session', {
    method: 'POST'
  });
  const data = await res.json();
  return data.session_id;
};

// Chat với AI
const chatWithAI = async (message, sessionId) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      session_id: sessionId
    })
  });
  const data = await res.json();
  return data;
};

// Sử dụng
const sessionId = await createSession();
const response = await chatWithAI('Tôi muốn mua áo thun nam màu đen size M', sessionId);
console.log(response.message);
```

## 6. Lưu Ý

- API không yêu cầu authentication (public)
- Session ID được tự động tạo nếu không cung cấp
- Lịch sử chat được lưu trong database
- AI được training với thông tin sản phẩm từ database
- Giới hạn lịch sử: 10 tin nhắn gần nhất được gửi cho AI

