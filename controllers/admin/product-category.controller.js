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