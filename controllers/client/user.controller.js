const User = require("../../models/user.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model")
const productsHelper = require("../../helpers/products")
const ForgotPassword = require("../../models/forgot-password.model");
const generateHelper = require("../../helpers/generate")
const sendMailHelper = require("../../helpers/sendMail")
const md5 = require("md5")

// [GET] /user/register
module.exports.register = (req, res) => {
    res.render("client/pages/user/register.pug",{
        pageTitle: "Đăng ký tài khoản"
    });
};

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
    const emailExist = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if(emailExist){
        req.flash("error",`Email ${req.body.email} đã tồn tại!`);
        res.redirect(`back`);
    }else{
        req.body.password = md5(req.body.password);

        const newUser = new User(req.body);
        await newUser.save();

        res.cookie("tokenUser",newUser.tokenUser);
        res.redirect(`/`);
    };
};

// [GET] /user/login
module.exports.login = async (req, res) => {
    const tokenUser = req.cookies.tokenUser;

    const user = await User.findOne({
        tokenUser: tokenUser,
        deleted: false
    });

    if(user){
        res.redirect(`/`);
    }else{
        res.render("client/pages/user/login.pug",{
            pageTitle: "Đăng nhập"
        });
    };
};

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if(!user){
        req.flash("error","Email không tồn tại!")
        res.redirect("back");
        return;
    };

    if( md5(password) != user.password ){
        req.flash("error","Sai mật khẩu!")
        res.redirect("back");
        return;
    };

    res.cookie("tokenUser",user.tokenUser);
    res.redirect(`/`);
};

// [GET] /user/logout
module.exports.logout = (req, res) => {
    res.clearCookie("tokenUser");
    res.redirect("/")
};

// [GET] /user/password/forgot
module.exports.forgotPassword = (req, res) => {
    res.render("client/pages/user/forgot-password.pug",{
        pageTitle: "Lấy lại mật khẩu"
    });
};

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if(!user){
        req.flash("error","Email không tồn tại!");
        res.redirect("back");
        return;
    };

    // Lưu thông tin vào DB
    const otp = generateHelper.generateRandomNumber(6);
    const objectForgotPassword = {
        email: email,
        otp: otp,
    };

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    //Gửi mã OTP tới email 
    const subject = `Mã OTP xác minh lấy lại mật khẩu`;
    const html = `Mã OTP để lấy lại mật khẩu là <b>${otp}</b>. Mã OTP sẽ có hiệu lực trong 5 phút.`
    sendMailHelper.sendMail(email, subject, html);

    res.redirect(`/user/password/otp/?email=${email}`);
};

// [GET] /user/password/otp
module.exports.otpPassword = (req, res) => {
    const email = req.query.email;
    res.render("client/pages/user/otp-password.pug",{
        pageTitle: "Nhập mã OTP",
        email: email,
    });
};

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    });

    if(!result){
        req.flash("error","OTP không hợp lệ!");
        res.redirect("back");
        return;
    };
    
    const user = await User.findOne({
        email: email
    });
    res.cookie("tokenUser",user.tokenUser);
    res.redirect(`/user/password/reset`);
};

// [GET] /user/password/reset
module.exports.resetPassword = (req, res) => {
    res.render("client/pages/user/reset-password.pug",{
        pageTitle: "Đổi mật khẩu",
    });
};

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
    const password = req.body.password;
    const tokenUser = req.cookies.tokenUser;

    await User.updateOne({
        tokenUser: tokenUser
    },{
        password: md5(password)
    })

   res.redirect("/")    
};

// [GET] /user/profile
module.exports.profile = (req, res) => {
    const user = res.locals.user;

    if(!user){
        res.redirect("/user/login");
        return;
    }

    res.render("client/pages/user/profile.pug",{
        pageTitle: "Thông tin cá nhân"
    });
};

// [PATCH] /user/profile
module.exports.profilePatch = async (req, res) => {
    const user = res.locals.user;

    if(user){
        await User.updateOne({
            _id: user.id
        },req.body);
        req.flash("success","Cập nhật thông tin thành công!")
     }else{
        req.flash("error","Cập nhật thông tin thất bại!")
     }
    
    res.redirect("back")
};

// [GET] /user/orders
module.exports.orderManagement = async (req, res) => {
    try {
        const { status } = req.query;
        const { id: userId } = res.locals.user;

        const find = {
            user_id: userId,
            deleted: false,
            ...(status && { status })
        };

        const orders = await Order.find(find).lean();

        //Lấy thông tin tất cả sản phẩm trong các đơn hàng
        const productIds = [...new Set(orders.flatMap(order => order.products.map(product => product.product_id)))];
        const productsInfo = await Product.find({ _id: { $in: productIds } }).select("_id title thumbnail").lean();
        const productsInfoMap = new Map(productsInfo.map(product => [product._id.toString(), product]));

        // Trả về thông tin của từng đơn hàng
        const processedOrders = orders.map(order => {
            const processedProducts = order.products.map(product => {
                const productInfo = productsInfoMap.get(product.product_id.toString());
                const newPrice = productsHelper.newProductPrice(product);
                const totalProductPrice = product.quantity * newPrice;

                return {
                    ...product,
                    productInfo,
                    newPrice,
                    totalProductPrice
                };
            });

            const totalOrderPrice = processedProducts.reduce((sum, product) => sum + product.totalProductPrice, 0);

            return {
                id: order._id,  
                order_id: order.order_id,
                products: processedProducts,
                totalOrderPrice,
                status: order.status,
            };
        });

        res.render("client/pages/user/order-management.pug", {
            pageTitle: "Quản lý đơn hàng",
            status,
            orders: processedOrders
        });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
};