const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        // Optional: tên banner
    },
    image: {
        type: Object,
        required: true
        // { public_id: "...", url: "..." }
    },
    link: {
        type: String,
        trim: true,
        // Optional: link khi click vào banner
    },
    order: {
        type: Number,
        default: 0
        // Thứ tự hiển thị (số nhỏ hơn hiển thị trước)
    },
    active: {
        type: Boolean,
        default: true
        // Banner có đang active không
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Banner", bannerSchema)

