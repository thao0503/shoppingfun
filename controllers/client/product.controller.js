const Product = require("../../models/product.model")
const productCategory = require("../../models/product-category.model")
const productsHelper = require("../../helpers/products") 
const getAllSubCategoryIds = require("../../helpers/getAllSubCategoryIds") 

// [GET] /products
module.exports.index = async (req,res) =>{
    const products = await Product.find({
        status: "active",
        deleted: false
    })
    .sort({position: "desc"});
    
    const productsRepriced = productsHelper.newProductsPrice(products);
      

    res.render("client/pages/products/index.pug",{
        pageTitle: "Danh sách sản phẩm",
        products: productsRepriced
    });
}

// [GET] /products/:categorySlug
module.exports.category = async (req,res) =>{ 

    try {
        const categorySlug = req.params.categorySlug;
        
        const category = await productCategory.findOne({
            slug: categorySlug,
            status: "active",
            deleted: false
        });
        
        //Lấy tất cả các danh mục con 
        const allCategories = await productCategory.find({
            deleted: false
        });
        
        const allSubIds = getAllSubCategoryIds(allCategories, category.id, "active");
        // Kêt thúc lấy tất cả các danh mục con

        const products = await Product.find({
            product_category_id: { $in: [category.id, ...allSubIds]},
            deleted: false
        }).sort({position: "desc"})

        const productsRepriced = productsHelper.newProductsPrice(products);

        res.render("client/pages/products/index.pug",{
            pageTitle: category.title,
            products: productsRepriced
        });
    } catch (error) {
        res.redirect("back")
    }
}

// [GET] /products/:slug
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            status: "active",
            slug: req.params.slug
        } 
    
        const product = await Product.findOne(find)
        res.render("client/pages/products/detail.pug",{
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`/products`)
    }
    
}