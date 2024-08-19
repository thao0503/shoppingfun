const Product = require("../../models/product.model");
const productCategory = require("../../models/product-category.model")
const searchHelpers = require("../../helpers/search");
const filterStatusHelpers = require("../../helpers/filterStatus");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system")
const createTree = require("../../helpers/createTree")


//[GET] /admin/products
module.exports.index = async (req, res) => {

    try {

        // Bộ lọc 
    const filterStatus = filterStatusHelpers(req.query);
    // Kết thúc Bộ lọc 

        let find = {
            deleted: false
        };

        // Lọc sản phẩm theo trạng thái
        if(req.query.status){
        find.status = req.query.status;
        }
        //Kết thúc lọc sản phẩm theo trạng thái

        //Tìm kiếm 
        const objectSearch = searchHelpers(req.query);
        if(objectSearch.keywordRegex){
            find.title = objectSearch.keywordRegex; 
        }
        //Kết thúc tìm kiếm 

        // Phân trang
        const countProducts = await Product.countDocuments(find);

        let objectPagination = paginationHelper(
            {
                currentPage: 1,
                limitItems: 4
            },
            req.query,
            countProducts
        )
        // Kết thúc Phân trang

        // Sort
        let sort = {}

        if(req.query.sortKey && req.query.sortValue ){
            sort[req.query.sortKey] =  req.query.sortValue
        }else{
            sort.position = "desc"
        }
        //End Sort


        const products = await Product.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);
        

        res.render("admin/pages/products/index.pug",{
            pageTitle: "Danh sách sản phẩm",
            products: products,
            filterStatus: filterStatus,
            keyword: objectSearch.keyword,
            pagination: objectPagination
        });
    } catch (error) {
        req.flash("error","Yêu cầu của bạn không hợp lệ!");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

}

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;
    req.flash('success', 'Cập nhật trạng thái thành công!');

    await Product.updateOne({ _id: id}, { status: status});
    res.redirect("back");
}

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "active":
            await Product.updateMany({_id: {$in: ids}}, {status: "active"});
            req.flash('success', `Đã cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "inactive":
            await Product.updateMany({_id: {$in: ids}}, {status: "inactive"});
            req.flash('success', `Đã cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "delete-all":
            await Product.updateMany(
                {_id: {$in: ids}}, 
                {
                    deleted: true,
                    deletedAt: new Date()
                }
                );
            req.flash('success', `Đã xóa thành công ${ids.length} sản phẩm!`);
            break;
        case "change-position":
            for(const item of ids){
                let [id, position] = item.split("-");
                position = parseInt(position);
                

                await Product.updateOne({ _id: id},{
                    position: position
                });
            }
            break;
    
        default:
            break;
    }

    res.redirect("back");
}

//[DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await Product.updateOne({ _id: id}, { 
        deleted: true,
        deletedAt: new Date()
    });
    req.flash('success', `Đã xóa thành công sản phẩm!`);
    res.redirect("back");
}

//[GET] /admin/products/create
module.exports.create = async(req, res) => {

    let find = {
        deleted: false
    }

    const category = await productCategory.find(find);

    const newCategory = createTree.tree(category)

    res.render("admin/pages/products/create",{
        pageTitle: "Thêm mới sản phẩm",
        category: newCategory
    }
        
    )
}

//[POST] /admin/products/create
module.exports.createPost = async(req, res) => {
    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)
    if(req.body.position == ""){
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    }else{
        req.body.position = parseInt(req.body.position);
    }
    
    const product = new Product(req.body);
    await product.save();

    res.redirect(`${systemConfig.prefixAdmin}/products`);
}

//[GET] /admin/products/edit/:id
module.exports.edit = async(req, res) => {

    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const product = await Product.findOne(find);
    
    
        res.render("admin/pages/products/edit",{
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product
        }
            
        )
    } catch (error) {

        req.flash("error","Không tìm thấy sản phẩm")
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
    
}

//[PATCH] /admin/products/edit/:id
module.exports.editPatch = async(req, res) => {
    const id = req.params.id
    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)
    req.body.position = parseInt(req.body.position);
     
    

    try {
        await Product.updateOne({ _id: id},req.body)
        req.flash("success","Cập nhật thành công")
    } catch (error) {
        req.flash("error","Cập nhật thất bại")

    }

    res.redirect(`back`);
}

//[GET] /admin/products/detail/:id
module.exports.detail = async(req, res) => {

    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const product = await Product.findOne(find);
    
        res.render("admin/pages/products/detail",{
            pageTitle: product.title,
            product: product
        }
            
        )
    } catch (error) {

        req.flash("error","Không tìm thấy sản phẩm")
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}
