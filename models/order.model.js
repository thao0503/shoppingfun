const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user_id: String,
    cart_id: String,
    order_id: {
        type: String,
        required: true,
        unique: true
    },
    userInfo: {
        fullName: String,
        phone: String,
        address: String
    },
    products:[
        {
            product_id: String,
            quantity: Number,
            price: Number,
            discountPercentage: Number
        }
    ], 
    status: {
        type: String,
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: [
        {
            account_id: String,
            updatedAt: Date
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
});

const Order = mongoose.model('Order', orderSchema, "orders");

module.exports = Order;