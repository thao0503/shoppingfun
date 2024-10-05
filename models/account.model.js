const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    token: {
        type: String,
        required: true
    },
    phone: String,
    avatar: String,
    role_id: String,
    status: String,
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
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
    deletedBy: {
        account_id: String,
        deletedAt: Date
    }
});

const Account = mongoose.model('Account', accountSchema, "accounts");

module.exports = Account;