const User = require("../../models/user.model");
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