const Product = require("../../models/product.model");
const searchHelpers = require("../../helpers/search");
const filterStatusHelpers = require("../../helpers/filterStatus");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system")
//[GET] /admin/products
module.exports.index = async (req, res) => {
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



    const products = await Product.find(find)
    .sort({position: "desc"})
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
    // const products = await Product.find(find);

    res.render("admin/pages/products/index.pug",{
        pageTitle: "Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
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
    res.render("admin/pages/products/create",{
        pageTitle: "Thêm mới săn phẩm"
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

    req.body.thumbnail = `/uploads/${req.file.filename}`

    const product = new Product(req.body);
    await product.save();

    res.redirect(`${systemConfig.prefixAdmin}/products`);
}

