const Role = require("../../models/role.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");

// [GET] /admin/roles
module.exports.index = async (req, res) => {

    try {
        let find = {
            deleted: false
        }
    
        const roles = await Role.find(find);
    
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
    
    const newRole = new Role(req.body)
    await newRole.save()

    res.redirect(`${systemConfig.prefixAdmin}/roles`);

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
    const id = req.params.id

    try {
        await Role.updateOne({ _id: id},req.body)
        req.flash("success","Cập nhật thành công")
    } catch (error) {
        req.flash("error","Cập nhật thất bại")

    }

    res.redirect(`back`);

}

//[GET] /admin/roles/detail/:id
module.exports.detail = async(req, res) => {

    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const role = await Role.findOne(find);
    
        res.render("admin/pages/roles/detail",{
            pageTitle: `Chi tiết ${role.title}`,
            role: role
        }
            
        )
    } catch (error) {

        req.flash("error","Không thể thực hiện yêu cầu của bạn!")
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }

}

//[DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    //Cập nhật lại dữ liệu phân quyền cho tài khoản
    await Account.updateMany({role_id: id},{ $unset: { role_id: ""} } )
    //Kết thúc cập nhật lại dữ liệu phân quyền cho tài khoản

    await Role.updateOne({ _id: id}, { 
        deleted: true,
        deletedAt: new Date()
    });
    req.flash('success', `Đã xóa thành công nhóm quyền!`);
    res.redirect("back");
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

    try {
        
        const permissions = JSON.parse(req.body.permissions);

        for (const item of permissions) {
            await Role.updateOne({ _id: item.id },{ permissions: item.permissions })
        }

        req.flash("success","Cập nhật phân quyền thành công!")
        res.redirect("back")

    } catch (error) {
        req.flash("error","Cập nhật phân quyền thất bại!")
        res.redirect("back")
    }
}