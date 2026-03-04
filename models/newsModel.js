const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
        // Tóm tắt tin tức
    },
    content: {
        type: String,
        required: true
        // Nội dung chi tiết tin tức
    },
    image: {
        type: Object,
        required: true
        // Hình ảnh đại diện
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NewsCategory',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
        // Người viết tin
    },
    views: {
        type: Number,
        default: 0
        // Số lượt xem
    },
    likes: {
        type: Number,
        default: 0
        // Số lượt thích
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date
        // Ngày xuất bản
    },
    tags: [String],
    // Tags để phân loại
    isFeatured: {
        type: Boolean,
        default: false
        // Tin nổi bật
    }
}, {
    timestamps: true
});

// Index để tìm kiếm và sắp xếp
newsSchema.index({ slug: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ isPublished: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ isFeatured: 1 });
newsSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('News', newsSchema);
