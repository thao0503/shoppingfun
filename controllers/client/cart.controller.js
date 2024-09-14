const Cart = require("../../models/cart.model")
const Product = require("../../models/product.model")
const productsHelper = require("../../helpers/products")

//[GET] /cart
module.exports.index = async (req, res) => {

    const cart = res.locals.miniCart;

    if (cart.products.length > 0) {
        for (const item of cart.products) {
            const productInfo = await Product.findOne({
                _id: item.product_id
            }).select("title thumbnail price discountPercentage slug stock");

            // Tính giá mới của mỗi sản phẩm
            const newPrice = productsHelper.newProductPrice(productInfo);
            item.newPrice = newPrice;
            //Kết thúc tính giá mới của mỗi sản phẩm

            item.totalProductPrice = newPrice * item.quantity;
            item.productInfo = productInfo;
        };
    };

    cart.totalCartPrice = cart.products.reduce((sum, item) => sum + item.totalProductPrice, 0)

    res.render("client/pages/cart/index.pug", {
        pageTitle: "Giỏ hàng",
        cartDetail: cart
    });
};

// [POST] /cart/add/:productid
module.exports.addProductPost = async (req, res) => {
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity);
    const cart = res.locals.miniCart;

    const existProductInCart = cart.products.find(item => item.product_id == productId);

    if (existProductInCart) {
        const newQuantity = quantity + existProductInCart.quantity;

        await Cart.updateOne({
            _id: cart.id,
            "products.product_id": productId
        }, {
            $set: {
                "products.$.quantity": newQuantity
            }
        });
    } else {
        const product = {
            product_id: productId,
            quantity: quantity
        };

        await Cart.updateOne({
            _id: cart.id
        }, {
            $push: {
                products: product
            }
        });
    }

    req.flash("success", "Thêm vào giỏ hàng thành công!");
    res.redirect("back")
}

//[GET] /cart/delete/:productId
module.exports.deleteProduct = async (req, res) => {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;

    await Cart.updateOne({
        _id: cartId
    }, {
        $pull: { products: { product_id: productId }}
    });

    req.flash("success", "Xóa sản phẩm thành công!")
    res.redirect("back")
};

//[GET] /cart/update/:productId/:quantity
module.exports.updateQuantity = async (req, res) => {

    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const quantity = req.params.quantity;

    if(!isNaN(quantity)){
        await Cart.updateOne({
            _id: cartId,
            "products.product_id": productId
        }, {
            $set: {
                "products.$.quantity": quantity
            }
        });
    }

    res.redirect("back")
};