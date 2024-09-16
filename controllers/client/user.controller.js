const User = require("../../models/user.model");
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