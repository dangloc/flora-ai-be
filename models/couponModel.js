const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    // Phần trăm: 0-100, Cố định: giá trị tiền tệ
    maxDiscount: {
        type: Number,
        // Giới hạn chiết khấu tối đa (cho percentage)
    },
    expiryDate: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    // Áp dụng cho sản phẩm cụ thể, nếu rỗng thì áp dụng cho tất cả
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],
    // Áp dụng cho category cụ thể, nếu rỗng thì áp dụng cho tất cả
    applicableCategories: [String],
    // Số lần sử dụng tối đa
    usageLimit: {
        type: Number,
        default: null
    },
    // Số lần đã sử dụng
    usageCount: {
        type: Number,
        default: 0
    },
    // Giới hạn sử dụng per user
    usagePerUser: {
        type: Number,
        default: 1
    },
    // Giá trị đơn hàng tối thiểu
    minOrderValue: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Lưu lịch sử sử dụng coupon
    usedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: Date,
        count: {
            type: Number,
            default: 1
        }
    }]
}, {
    timestamps: true
});

// Index để tìm coupon
couponSchema.index({ code: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isActive: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
