const productCategory = require("../../models/product-category.model")
const product = require("../../models/product.model")
const account = require("../../models/account.model")
const user = require("../../models/user.model")
const order = require("../../models/order.model")

// [GET] /admin/dashboard
module.exports.dashboard = async (req, res) => {
    const statistic = {
        productCategory: {
            total: 0,
            active: 0,
            inactive: 0
        },
        product: {
            total: 0,
            active: 0,
            inactive: 0
        },
        account: {
            total: 0,
            active: 0,
            inactive: 0
        },
        user: {
            total: 0,
            active: 0,
            inactive: 0
        },
        order: {
            total: 0,
            pending: 0,
            confirmed: 0,
            shipping: 0,
            completed: 0,
            cancelled: 0
        }
    };
    
    //Danh mục sản phẩm
    statistic.productCategory.total = await productCategory.countDocuments({
        deleted: false
    });
    statistic.productCategory.active = await productCategory.countDocuments({
        deleted: false,
        status: "active"
    });
    statistic.productCategory.inactive = await productCategory.countDocuments({
        deleted: false,
        status: "inactive"
    });

    //Sản phẩm
    statistic.product.total = await product.countDocuments({
        deleted: false
    });
    statistic.product.active = await product.countDocuments({
        deleted: false,
        status: "active"
    });
    statistic.product.inactive = await product.countDocuments({
        deleted: false,
        status: "inactive"
    });

    //Tài khoản admin
    statistic.account.total = await account.countDocuments({
        deleted: false
    });
    statistic.account.active = await account.countDocuments({
        deleted: false,
        status: "active"
    });
    statistic.account.inactive = await account.countDocuments({
        deleted: false,
        status: "inactive"
    });

    //Tài khoản client
    statistic.user.total = await user.countDocuments({
        deleted: false
    });
    statistic.user.active = await user.countDocuments({
        deleted: false,
        status: "active"
    });
    statistic.user.inactive = await user.countDocuments({
        deleted: false,
        status: "inactive"
    });

    //Đơn hàng
    statistic.order.total = await order.countDocuments({
        deleted: false
    });
    statistic.order.pending = await order.countDocuments({
        deleted: false,
        status: "pending"
    });
    statistic.order.confirmed = await order.countDocuments({
        deleted: false,
        status: "confirmed"
    });
    statistic.order.shipping = await order.countDocuments({
        deleted: false,
        status: "shipping"
    });
    statistic.order.completed = await order.countDocuments({
        deleted: false,
        status: "completed"
    });
    statistic.order.cancelled = await order.countDocuments({
        deleted: false,
        status: "cancelled"
    });


    res.render("admin/pages/dashboard/index.pug",{
        pageTitle: "Trang tổng quan",
        statistic: statistic
    });
}