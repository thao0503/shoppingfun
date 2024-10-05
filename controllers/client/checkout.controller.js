const Cart = require("../../models/cart.model")
const Product = require("../../models/product.model")
const Order = require("../../models/order.model")
const productsHelper = require("../../helpers/products")

//[GET] /checkout
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

    res.render("client/pages/checkout/index.pug", {
        pageTitle: "Thanh toán",
        cartDetail: cart
    });
};

//[POST] /checkout/order
module.exports.order = async (req, res) => {
    const userInfo = req.body;
    const cart = res.locals.miniCart;

    // Lấy thông tin sản phẩm trong đơn hàng
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

    const orderData = {
        cart_id: cart.id,
        userInfo: userInfo,
        products: products
    };

    // Thêm user_id nếu người dùng đã đăng nhập
    if (res.locals.user && res.locals.user.id) {
        orderData.user_id = res.locals.user.id;
    }
    const order = new Order(orderData);
    await order.save();

    //Cập nhật lại giỏ hàng khi đặt hàng thành công
    await Cart.updateOne({
        _id: cart.id
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
