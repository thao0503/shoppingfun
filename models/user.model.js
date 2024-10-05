const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    tokenUser: {
        type: String,
        required: true
    },
    phone: String,
    avatar: String,
    address: String,
    status: {
        type: String,
        default: "active"
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
},{
    timestamps: true
});

const User = mongoose.model('User', userSchema, "users");

module.exports = User;