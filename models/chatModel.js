const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Optional: nếu muốn lưu theo user
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Optional: khi admin reply
    },
    session_id: {
        type: String,
        // ID phiên chat (có thể dùng để phân biệt các cuộc trò chuyện)
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant', 'admin'],
            required: true
        },
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // Thêm trường này để track ai gửi message (user, assistant AI, hoặc admin)
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    product_context: {
        type: Object,
        // Lưu thông tin sản phẩm được đề cập trong chat
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Chat", chatSchema)

