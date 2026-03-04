const mongoose = require('mongoose')


const paymentSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    paymentID:{
        type: String,
        required: true
    },
    address:{
        type: Object,
        required: true
    },
    cart:{
        type: Array,
        default: []
    },
    status:{
        type: Boolean,
        default: false
    },
    paymentMethod:{
        type: String,
        enum: ['stripe', 'cash'],
        default: 'stripe'
    },
    deliveryStatus:{
        type: String,
        enum: ['pending', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },
    discount:{
        type: Number,
        default: 0
    },
    couponId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    totalAmount:{
        type: Number,
        // Tổng tiền sau giảm giá
    }
}, {
    timestamps: true
})


module.exports = mongoose.model("Payments", paymentSchema)