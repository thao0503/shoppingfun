const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");
const md5 = require("md5")


// [GET] /admin/accounts
module.exports.index = async (req, res) => {

    try {
        let find = {
            deleted: false
        }
    
        const accounts = await Account.find(find).select("-password -token");

        for (const account of accounts) {
            const role = await Role.findOne({
                _id: account.role_id,
                deleted: false
            });

            account.role = role;
            
        }
    
        res.render("admin/pages/accounts/index.pug",{
            pageTitle: "Danh sách tài khoản",
            accounts: accounts
        });
    } catch (error) {
        req.flash("error","Yêu cầu của bạn chưa thể thục hiện");
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
};

//[GET] /admin/accounts/create
module.exports.create = async(req, res) => {

    const roles = await Role.find({
        deleted: false
    });

    res.render("admin/pages/accounts/create",{
        pageTitle: "Tạo tài khoản",
        roles: roles,
    }
    );
};

//[POST] /admin/accounts/create
module.exports.createPost = async(req, res) => {

    const emailExist = await Account.findOne({
        email: req.body.email,
        deleted: false
    });

    if(emailExist){
        req.flash("error",`Email ${req.body.email} đã tồn tại!`);
        res.redirect(`back`);
    }else{
        req.body.password = md5(req.body.password);

        const newAccount = new Account(req.body);
        await newAccount.save();
    
        req.flash("success","Thêm mới tài khoản thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    };
};