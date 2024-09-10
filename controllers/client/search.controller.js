const Product = require("../../models/product.model")
const productsHelper = require("../../helpers/products") 

// [GET] /search
module.exports.index = async (req,res) =>{
    const keyword = req.query.keyword;

    let productsRepriced = [];

    if(keyword){
        const keywordRegex = new RegExp(keyword,"i")

        const products = await Product.find({
            title: keywordRegex,
            status: "active",
            deleted: false
        });

        productsRepriced = productsHelper.newProductsPrice(products);
    }
    

    res.render("client/pages/search/index.pug",{
        pageTitle: keyword,
        keyword: keyword,
        products: productsRepriced
    });
}
