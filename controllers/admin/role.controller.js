const Role = require("../../models/role.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const checkArraysEqual = require("../../helpers/checkArraysEqual");

// [GET] /admin/roles
module.exports.index = async (req, res) => {

    try {
        let find = {
            deleted: false
        }
    
        const roles = await Role.find(find);

        for (const role of roles) {

            // Lấy thông tin người tạo
            const creator = await Account.findOne({
                _id: role.createdBy.account_id
            });

            if(creator){
                role.createdBy.userFullName = creator.fullName;
            };

            // Lấy thông tin người cập nhật gần nhất
            const updatedBy = role.updatedBy.slice(-1)[0];
            if(updatedBy){
                const updater = await Account.findOne({
                    _id: updatedBy.account_id
                });

                updatedBy.userFullName = updater.fullName;
            };
        };
    
        res.render("admin/pages/roles/index.pug",{
            pageTitle: "Nhóm quyền",
            roles: roles
        });
    } catch (error) {
        req.flash("error","yêu cầu của bạn chưa thể thục hiện");
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
    
}

//[GET] /admin/roles/create
module.exports.create = async(req, res) => {

    res.render("admin/pages/roles/create",{
        pageTitle: "Tạo nhóm quyền"
    }
    )
}

//[POST] /admin/roles/create
module.exports.createPost = async(req, res) => {

    const permissions = res.locals.userRole.permissions;
    if(permissions.includes("roles_create")){
        req.body.createdBy = {
            account_id: res.locals.user.id
        }
    
        const newRole = new Role(req.body)
        await newRole.save()
    
        req.flash("success","Thêm mới nhóm quyền thành công!")
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }else{
        return;
    }
}

//[GET] /admin/roles/edit/:id
module.exports.edit = async(req, res) => {

    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const role = await Role.findOne(find);
    
        res.render("admin/pages/roles/edit",{
            pageTitle: "Chỉnh sửa nhóm quyền",
            role: role,
        }
            
        )
    } catch (error) {

        req.flash("error","Không tìm thấy nhóm quyền!")
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
    
}

//[PATCH] /admin/roles/edit/:id
module.exports.editPatch = async(req, res) => {

    const permissions = res.locals.userRole.permissions;
    if(permissions.includes("roles_edit")){

        const id = req.params.id
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        }    

        await Role.updateOne({ _id: id},{
            ...req.body,
            $push: {updatedBy: updatedBy}
        })

        req.flash("success","Cập nhật thành công")
        res.redirect(`back`);
    }else{
        return;
    }
}

//[GET] /admin/roles/detail/:id
module.exports.detail = async(req, res) => {

    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const role = await Role.findOne(find);

         //Lấy thông tin người tạo
         const creator =  await Account.findOne({
            _id: role.createdBy.account_id
        });

        if(creator){
            role.createdBy.userFullName = creator.fullName;
        };

        // Lấy thông tin những người cập nhật
        const updatedBy = role.updatedBy;
        if(updatedBy){
            for (const item of updatedBy) {
                const updater = await Account.findOne({
                    _id: item.account_id
                });
    
                item.userFullName = updater.fullName;
            };
        };
    
        res.render("admin/pages/roles/detail",{
            pageTitle: `Chi tiết ${role.title}`,
            role: role
        }
        );
    } catch (error) {
        req.flash("error","Không thể thực hiện yêu cầu của bạn!")
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }

}

//[DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {

    const permissions = res.locals.userRole.permissions;
    if(permissions.includes("roles_delete")){
        const id = req.params.id;

        //Cập nhật lại dữ liệu phân quyền cho tài khoản
        await Account.updateMany({role_id: id},{ $unset: { role_id: ""} } )
        //Kết thúc cập nhật lại dữ liệu phân quyền cho tài khoản

        await Role.updateOne({ _id: id}, { 
            deleted: true,
            deletedBy: {
                account_id: res.locals.user.id,
                deletedAt: new Date()
            }
        });
        req.flash('success', `Đã xóa thành công nhóm quyền!`);
        res.redirect("back");
    }else{
        return;
    }
}

//[GET] /admin/roles/permissions
module.exports.permissions = async(req, res) => {

    try {
        const find = {
            deleted: false,
        }
    
        const roles = await Role.find(find);
    
        res.render("admin/pages/roles/permissions",{
            pageTitle: `Phân quyền`,
            roles: roles
        }
            
        )
    } catch (error) {

        req.flash("error","Không thể thực hiện yêu cầu của bạn!")
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }

}

//[PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async(req, res) => {

    const permissions = res.locals.userRole.permissions;
    if(permissions.includes("roles_permissions")){
        try {
        
            const permissions = JSON.parse(req.body.permissions);
    
            const updatedBy = {
                account_id: res.locals.user.id,
                updatedAt: new Date()
            } 
    
            let hasChanges = false; // cờ theo dõi thay đổi
            for (const item of permissions) {
                const role = await Role.findOne({ _id: item.id});
    
                if(!checkArraysEqual(role.permissions,item.permissions)){
                    await Role.updateOne({ _id: item.id },{ 
                        permissions: item.permissions,
                        $push: {updatedBy: updatedBy}
                    });
                    hasChanges = true;
                }
            }
    
            // Gửi phản hồi sau khi hoàn tất cập nhật
            if (hasChanges) {
                req.flash("success", "Cập nhật phân quyền thành công!");
            } else {
                req.flash("warning", "Chưa có thay đổi!");
            };
    
            res.redirect("back")
    
        } catch (error) {
            req.flash("error","Cập nhật phân quyền thất bại!")
            res.redirect("back")
        }
    }else{
        return;
    }
}