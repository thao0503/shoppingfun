const Product = require("../../models/product.model")
const productsHelper = require("../../helpers/products") 

// [GET] /
module.exports.index = async (req,res) =>{

    //Lấy ra sản phẩm nổi bật
    const featuredProducts = await Product.find({
        featured: "1",
        deleted: false,
        status: "active"
    }).limit(6);

    const featuredProductsRepriced = productsHelper.newProductsPrice(featuredProducts);
    //Kết thúc lấy ra sản phẩm nổi bật
    
    //Lấy ra sản phẩm mới nhất
    const newProducts = await Product.find({
        deleted: false,
        status: "active"
    }).sort({position: "desc"}).limit(6);
    const newProductsRepriced = productsHelper.newProductsPrice(newProducts);
    //Kết thúc lấy ra sản phẩm mới nhất

    res.render("client/pages/home/index.pug",{
        pageTitle: "Trang chủ",
        featuredProducts: featuredProductsRepriced,
        newProducts: newProductsRepriced
    });
}