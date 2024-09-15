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
}

