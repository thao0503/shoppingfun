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