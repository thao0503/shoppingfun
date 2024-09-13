const Cart = require("../../models/cart.model")
const Product = require("../../models/product.model")
const Order = require("../../models/order.model")
const productsHelper = require("../../helpers/products")

//[GET] /checkout
module.exports.index = async (req, res) => {

    const cartId = req.cookies.cartId;
    const cart = await Cart.findOne({
        _id: cartId
    });

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

    res.render("client/pages/checkout/index.pug", {
        pageTitle: "Thanh toán",
        cartDetail: cart
    });
};

//[POST] /checkout/order
module.exports.order = async (req, res) => {
    const cartId = req.cookies.cartId;
    const userInfo = req.body;
    const cart = await Cart.findOne({
        _id: cartId
    });

    const products = [];

    for (const product of cart.products) {
        const productObject = {
            product_id: product.product_id,
            quantity: product.quantity,
            price: 0,
            discountPercentage: 0
        };

        const productInfo = await Product.findOne({
            _id: product.product_id
        }).select("price discountPercentage");

        productObject.price = productInfo.price;
        productObject.discountPercentage = productInfo.discountPercentage;

        products.push(productObject);
    }

    const order = new Order({
        cart_id: cartId,
        userInfo: userInfo,
        products: products
    });
    await order.save();

    await Cart.updateOne({
        _id: cartId
    },{
        products: []
    });

    res.redirect(`/checkout/success/${order.id}`)
};

// [GET] /checkout/success/:orderId
module.exports.successOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findOne({
            _id: orderId
        });
    
        for (const product of order.products) {
            const productInfo = await Product.findOne({
                _id: product.product_id
            }).select("title thumbnail");
    
            product.productInfo = productInfo;
            product.newPrice = productsHelper.newProductPrice(product);
            product.totalProductPrice = product.quantity * product.newPrice;
        };
    
        order.totalOrderPrice = order.products.reduce((sum,product) => sum + product.totalProductPrice ,0);
    
        res.render("client/pages/checkout/success.pug",{
            pageTitle: "Đặt hàng thành công",
            order: order
        });
    } catch (error) {
        res.redirect("/");
    }
};
