const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    images: {
        type: Object,
        // Optional: hình ảnh cho category
        // { public_id: "...", url: "..." }
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Category", categorySchema)