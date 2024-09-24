const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user_id: String,
    cart_id: String,
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
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
},
{
    timestamps: true
}
);

const Cart = mongoose.model('Order', orderSchema, "orders");

module.exports = Cart;