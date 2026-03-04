const express = require('express');
const router = express.Router();
const adminChatCtrl = require('../controllers/adminChatCtrl');

// Lấy danh sách admin
router.get('/admin-list', adminChatCtrl.getAdminList);

// Lấy tất cả user chats (từ Chat collection - chat với AI)
router.get('/all-user-chats', adminChatCtrl.getAllUserChats);

// Lấy tất cả chats (dành cho admin xem)
router.get('/all-chats', adminChatCtrl.getAllChats);

// Consolidate chats
router.post('/consolidate-chats', adminChatCtrl.consolidateChats);

// Lấy danh sách chat của user
router.get('/admin-chats/:userId', adminChatCtrl.getChatList);

// Lấy lịch sử chat với main admin (chỉ cần userId)
router.get('/admin-chat/:userId', adminChatCtrl.getChatHistory);

// Tạo hoặc lấy chat room
router.post('/admin-chat', adminChatCtrl.createOrGetChat);

// Đóng chat
router.put('/admin-chat/close/:chatId', adminChatCtrl.closeChat);

// Xóa chats trống
router.post('/cleanup-empty-chats', adminChatCtrl.cleanupEmptyChats);

// Debug: health check
router.get('/debug/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;

