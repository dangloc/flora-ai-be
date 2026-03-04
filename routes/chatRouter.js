const router = require('express').Router()
const chatCtrl = require('../controllers/chatCtrl')
const auth = require('../middleware/auth')

// Public routes - ai cũng có thể chat
router.route('/chat')
    .post(chatCtrl.chat)

router.route('/chat/session')
    .post(chatCtrl.createSession)

router.route('/chat/history/:session_id')
    .get(chatCtrl.getChatHistory)
    .delete(chatCtrl.clearChatHistory)

module.exports = router

