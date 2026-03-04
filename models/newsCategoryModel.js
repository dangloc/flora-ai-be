const mongoose = require('mongoose');

const newsCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
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
    },
    image: {
        type: Object,
        // Icon hoặc hình đại diện cho category
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
        // Để sắp xếp thứ tự hiển thị
    }
}, {
    timestamps: true
});

// Index
newsCategorySchema.index({ slug: 1 });
newsCategorySchema.index({ isActive: 1 });
newsCategorySchema.index({ order: 1 });

module.exports = mongoose.model('NewsCategory', newsCategorySchema);
