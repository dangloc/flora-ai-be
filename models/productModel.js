const mongoose = require('mongoose')


// Schema cho biến thể sản phẩm
const variantSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        trim: true
        // Note: unique sẽ được validate ở controller level
    },
    attributes: {
        type: Object,
        required: true
        // Ví dụ: { "color": "red", "size": "M" }
    },
    inventory: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    price: {
        type: Number,
        // Optional: nếu không có thì dùng price của product
    },
    images: {
        type: Object,
        // Optional: hình ảnh riêng cho variant
    }
}, {
    _id: true,
    timestamps: false
})

const productSchema = new mongoose.Schema({
    product_id:{
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    title:{
        type: String,
        trim: true,
        required: true
    },
    price:{
        type: Number,
        trim: true,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    images:{
        type: Object,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    brand:{
        type: String,
        trim: true,
        required: true
    },
    checked:{
        type: Boolean,
        default: false
    },
    sold:{
        type: Number,
        default: 0
    },
    variants: {
        type: [variantSchema],
        default: []
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true, //important
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// Virtual field: inventory is calculated from variants
productSchema.virtual('inventory').get(function() {
    if (this.variants && this.variants.length > 0) {
        return this.variants.reduce((sum, variant) => {
            return sum + (parseInt(variant.inventory) || 0);
        }, 0);
    }
    return 0;
});


module.exports = mongoose.model("Products", productSchema)