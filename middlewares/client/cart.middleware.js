const Cart = require("../../models/cart.model")
const Product = require("../../models/product.model")

module.exports.loadOrCreateCart = async (req, res, next) => {
    if(!req.cookies.cartId){
        const cart = new Cart();
        await cart.save();

        const expiresCookie = 365 * 24 * 60 * 60 * 1000;

        res.cookie("cartId", cart.id,{
            expires: new Date(Date.now() + expiresCookie)
        });
    }else{
        const cart = await Cart.findOne({
            _id: req.cookies.cartId
        });

        //Xóa sản phẩm trong giỏ hàng nếu sản phẩm bị xóa hoặc dừng hoạt đông
        const productIds = cart.products.map(product => product.product_id);

        // Tìm tất cả các sản phẩm hợp lệ
        const validProducts = await Product.find({
            _id: { $in: productIds },         
            status: 'active',                 
            deleted: false                    
        });
        const validProductIds = validProducts.map(product => product.id);

        // Lọc ra những sản phẩm trong giỏ hàng không còn hợp lệ (không còn tồn tại hoặc bị dừng hoạt động)
        const invalidProducts = cart.products.filter(product => 
            !validProductIds.includes(product.product_id)
        );
        const invalidProductIds = invalidProducts.map(p => p.product_id);

        // Xóa các sản phẩm không hợp lệ khỏi giỏ hàng
        if (invalidProducts.length > 0) {
            await Cart.updateOne(
                { _id: cart.id },
                {
                    $pull: {
                        products: {
                            product_id: { $in: invalidProductIds }
                        }
                    }
                }
            );
        };

        cart.totalQuantity = cart.products.reduce((sum, item) => sum + item.quantity, 0);

        res.locals.miniCart = cart;
    }

    next();
}