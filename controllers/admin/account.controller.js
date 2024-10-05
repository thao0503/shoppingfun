const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");
const md5 = require("md5")
const generateHelper = require("../../helpers/generate");


// [GET] /admin/accounts
module.exports.index = async (req, res) => {
    //Kiểm tra quyền truy cập
    const permissions = res.locals.userRole.permissions;
    if (!permissions.includes("accounts_view")) {
        return res.status(403).render("admin/errors/403.pug", {
            message: "Bạn không có quyền truy cập vào trang này."
        });
    };

    try {
        let find = {
            deleted: false
        }
    
        const accounts = await Account.find(find).select("-password -token");

        for (const account of accounts) {
            // Lấy thông tin nhóm quyền
            if(account.role_id){
                const role = await Role.findOne({
                    _id: account.role_id,
                    deleted: false
                });

                account.role = role;
            };
            // Kết thúc lấy thông tin nhóm quyền

            // Lấy thông tin người tạo
            const creator = await Account.findOne({
                _id: account.createdBy.account_id
            });

            if(creator){
                account.createdBy.userFullName = creator.fullName;
            };
            // Kết thúc lấy thông tin người tạo

            // Lấy thông tin người cập nhật gần nhất
            const updatedBy = account.updatedBy.slice(-1)[0];
            if(updatedBy){
                const updater = await Account.findOne({
                    _id: updatedBy.account_id
                });

                updatedBy.userFullName = updater.fullName;
            };
            // Kết thúc lấy thông tin người cập nhật gần nhất

        };    
        res.render("admin/pages/accounts/index.pug",{
            pageTitle: "Danh sách tài khoản",
            accounts: accounts
        });
    } catch (error) {
        req.flash("error","Yêu cầu của bạn chưa thể thục hiện");
        res.redirect(`back`);
    }
};

//[GET] /admin/accounts/create
module.exports.create = async(req, res) => {
    //Kiểm tra quyền truy cập
    const permissions = res.locals.userRole.permissions;
    if (!permissions.includes("accounts_create")) {
        return res.status(403).render("admin/errors/403.pug", {
            message: "Bạn không có quyền truy cập vào trang này."
        });
    };

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

    const permissions = res.locals.userRole.permissions;
    if(permissions.includes("accounts_create")){
        const emailExist = await Account.findOne({
            email: req.body.email,
            deleted: false
        });
    
        if(emailExist){
            req.flash("error",`Email ${req.body.email} đã tồn tại!`);
            res.redirect(`back`);
        }else{
            req.body.password = md5(req.body.password);
    
            req.body.createdBy = {
                account_id: res.locals.user.id
            }

            // Tạo token
            let token;
            let isUnique = false;
            while (!isUnique) {
                token = generateHelper.generateRandomString(20);
                const existingAccount = await Account.findOne({ 
                    token: token,
                    deleted: false
                });
                if (!existingAccount) {
                    isUnique = true;
                }
            };
            req.body.token = token;
            // Kết thúc tạo token
    
            const newAccount = new Account(req.body);
            await newAccount.save();
        
            req.flash("success","Thêm mới tài khoản thành công!");
            res.redirect(`${systemConfig.prefixAdmin}/accounts`);
        };
    }else{
        return;
    }
};

//[GET] /admin/accounts/edit/:id
module.exports.edit = async(req,res) => {
     //Kiểm tra quyền truy cập
     const permissions = res.locals.userRole.permissions;
     if (!permissions.includes("accounts_edit")) {
         return res.status(403).render("admin/errors/403.pug", {
             message: "Bạn không có quyền truy cập vào trang này."
         });
     };
 
    try {
        const find = {
            _id: req.params.id,
            deleted: false
        };

        const account = await Account.findOne(find);
        
        const roles = await Role.find({
            deleted: false
        })


        res.render("admin/pages/accounts/edit",{
            pageTitle: "Cập nhật tài khoản",
            account: account,
            roles: roles
        }
        );
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
}

//[PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {

    const permissions = res.locals.userRole.permissions;
    if(permissions.includes("accounts_edit")){
        const id = req.params.id;

        const emailExist = await Account.findOne({
            _id: { $ne: id},
            email: req.body.email,
            deleted: false
        });
    
        if(emailExist){
            req.flash("error",`Email ${req.body.email} đã tồn tại!`);
        }else{
            if(req.body.password){
                req.body.password = md5(req.body.password);
            }else{
                delete req.body.password;
            }
            
            const updatedBy = {
                account_id: res.locals.user.id,
                updatedAt: new Date()
            };
    
            await Account.updateOne({_id: id},{
                ...req.body,
                $push: {updatedBy: updatedBy}
            });
            req.flash("success","Cập nhật tài khoản thành công!");
        }
    
        res.redirect(`back`);
    }else{
        return;
    }
}


//[GET] /admin/accounts/detail/:id
module.exports.detail = async(req,res) => {
     //Kiểm tra quyền truy cập
     const permissions = res.locals.userRole.permissions;
     if (!permissions.includes("accounts_view")) {
         return res.status(403).render("admin/errors/403.pug", {
             message: "Bạn không có quyền truy cập vào trang này."
         });
     };
 
    try {
        const find = {
            _id: req.params.id,
            deleted: false
        };

        const account = await Account.findOne(find);
        
        if(account.role_id){
            const role = await Role.findOne({
                _id: account.role_id,
                deleted: false
            });

            account.role = role;

        }else{
            account.role = { title: "Tài khoản chưa được phân quyền" };
        }


        res.render("admin/pages/accounts/detail",{
            pageTitle: "Chi tiết tài khoản",
            account: account,
        }
        );
    } catch (error) {
        req.flash("error","Không tìm thấy tài khoản!")
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
}

//[DELETE] /admin/accounts/delete/:id
module.exports.deleteItem = async (req, res) => {

    const permissions = res.locals.userRole.permissions;
    if(permissions.includes("accounts_delete")){
        const id = req.params.id;

        await Account.updateOne({ _id: id}, { 
            deleted: true,
            deletedBy: {
                account_id: res.locals.user.id,
                deletedAt: new Date()
            }
        });
        req.flash('success', ` Xóa tài khoản thành công!`);
        res.redirect("back");
    }else{
        return;
    }
}

//[PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {

    const permissions = res.locals.userRole.permissions;
    if(permissions.includes("accounts_edit")){
        const status = req.params.status;
        const id = req.params.id;
    
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };
    
        await Account.updateOne({ _id: id}, { 
            status: status,
            $push: {updatedBy: updatedBy}
        });
    
        req.flash('success', 'Cập nhật trạng thái thành công!');
        res.redirect("back");
    }else{
        return;
    }
}