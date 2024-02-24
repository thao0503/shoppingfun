const Product = require("../../models/product.model");
const searchHelpers = require("../../helpers/search");
const filterStatusHelpers = require("../../helpers/filterStatus");
const paginationHelper = require("../../helpers/pagination");

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



    const products = await Product.find(find).limit(objectPagination.limitItems).skip(objectPagination.skip);
    // const products = await Product.find(find);

    res.render("admin/pages/products/index.pug",{
        pageTitle: "Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}