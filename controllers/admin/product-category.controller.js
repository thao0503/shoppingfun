const productCategory = require("../../models/product-category.model")
const systemConfig = require("../../config/system")
const createTree = require("../../helpers/createTree")

//[GET] /admin/products-category
module.exports.index = async (req, res) => {

    let find = {
        deleted: false
    };

    const records = await productCategory.find(find);

    const newRecords = createTree.tree(records)
    
     res.render("admin/pages/products-category/index.pug",{
         pageTitle: "Danh mục sản phẩm",
         records: newRecords
     });
 }

 //[GET] /admin/products-category/create
module.exports.create = async(req, res) => {

    let find = {
        deleted: false
    }

    const records = await productCategory.find(find);

    const newRecords = createTree.tree(records)
    
    res.render("admin/pages/products-category/create",{
        pageTitle: "Thêm mới danh mục sản phẩm",
        records: newRecords
    }  
    )
}

//[POST] /admin/products-category/create
module.exports.createPost = async(req, res) => {
    if(req.body.position == ""){
        const countProducts = await productCategory.countDocuments();
        req.body.position = countProducts + 1;
    }else{
        req.body.position = parseInt(req.body.position);
    }
    
    const record = new productCategory(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
}

 //[GET] /admin/products-category/edit/:id
 module.exports.edit = async(req, res) => {

    try {
        const id = req.params.id;
    
    const data = await productCategory.findOne({
        _id: id,
        deleted: false
    })

    const records = await productCategory.find({
        deleted: false
    });

    const newRecords = createTree.tree(records)

    res.render("admin/pages/products-category/edit",{
        pageTitle: "Thêm mới danh mục sản phẩm",
        data: data,
        records: newRecords
    }  
    )
    } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
    
}

//[PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async(req, res) => {
    
    try {
        const id = req.params.id
        req.body.position = parseInt(req.body.position);
        await productCategory.updateOne({ _id: id},req.body)
        req.flash("success","Cập nhật thành công")
    } catch (error) {
        req.flash("error","Cập nhật thất bại")

    }

    res.redirect(`back`);
}

//[GET] /admin/products-category/detail/:id
module.exports.detail = async(req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };
    
        const data = await productCategory.findOne(find);

        if (!data) {
            req.flash("error", "Không tìm thấy danh mục sản phẩm");
            return res.redirect(`${systemConfig.prefixAdmin}/products-category`);
        }

        let parentTitle = "";

        if (data.parent_id) {
            const parentId = data.parent_id;
            const parent = await productCategory.findOne({ _id: parentId });

            if (parent) {
                parentTitle = parent.title;
            } else {
                parentTitle = "Không tìm thấy danh mục cha";
            }
        } else {
            parentTitle = "Đây là danh mục cấp cao nhất.";
        }

        res.render("admin/pages/products-category/detail", {
            pageTitle: data.title,
            data: data,
            parentTitle: parentTitle
        });
    } catch (error) {
        req.flash("error", "Không tìm thấy sản phẩm");
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
};

//[DELETE] /admin/products-category/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await productCategory.updateOne({ _id: id}, { 
        deleted: true,
        deletedAt: new Date()
    });

    // Cập nhật lại data cho danh mục con
    const data = await productCategory.findOne({_id: id})
    await productCategory.updateMany({parent_id: id},{ $set: { parent_id: data.parent_id } } )

    req.flash('success', `Đã xóa thành công!`);
    res.redirect("back");
}

//[PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await productCategory.updateOne({ _id: id}, { status: status});
    req.flash('success', 'Cập nhật trạng thái thành công!');
    res.redirect("back");
}