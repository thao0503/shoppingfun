const productCategory = require("../../models/product-category.model")
const product = require("../../models/product.model")
const account = require("../../models/account.model")
const user = require("../../models/user.model")

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

    res.render("admin/pages/dashboard/index.pug",{
        pageTitle: "Trang tổng quan",
        statistic: statistic
    });
}