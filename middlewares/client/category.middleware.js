const productCategory = require("../../models/product-category.model")
const createTree = require("../../helpers/createTree")

module.exports.category = async (req, res, next) => {
    const categories = await productCategory.find({
        deleted: false
    });

    const newCategories = createTree.tree(categories,"","active")

    res.locals.categories = newCategories;
    next();
}