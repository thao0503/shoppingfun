const Product = require("../../models/product.model")
const productCategory = require("../../models/product-category.model")
const productsHelper = require("../../helpers/products")
const getAllSubCategoryIds = require("../../helpers/getAllSubCategoryIds")
const paginationHelper = require("../../helpers/pagination");

// [GET] /products
module.exports.index = async (req, res) => {
    const find = {
        status: "active",
        deleted: false
    }

    // Phân trang
    const countProducts = await Product.countDocuments(find);
    let objectPagination = paginationHelper({
            currentPage: 1,
            limitItems: 12
        },
        req.query,
        countProducts
    )
    // Kết thúc Phân trang


    const products = await Product.find(find)
        .sort({
            position: "desc"
        })
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);;

    const productsRepriced = productsHelper.newProductsPrice(products);


    res.render("client/pages/products/index.pug", {
        pageTitle: "Danh sách sản phẩm",
        products: productsRepriced,
        pagination: objectPagination
    });
}

// [GET] /products/:categorySlug
module.exports.category = async (req, res) => {

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
            product_category_id: {
                $in: [category.id, ...allSubIds]
            },
            deleted: false
        }).sort({
            position: "desc"
        })

        const productsRepriced = productsHelper.newProductsPrice(products);

        res.render("client/pages/products/index.pug", {
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
            slug: req.params.productSlug
        }

        const product = await Product.findOne(find);

        if (product.product_category_id) {
            const category = await productCategory.findOne({
                _id: product.product_category_id,
                status: "active",
                deleted: false
            });
            product.category = category;
        };

        product.newPrice = productsHelper.newProductPrice(product);

        res.render("client/pages/products/detail.pug", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`/products`)
    }

}