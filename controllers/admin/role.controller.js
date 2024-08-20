const Role = require("../../models/role.model");
const systemConfig = require("../../config/system")


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