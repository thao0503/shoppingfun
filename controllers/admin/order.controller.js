const Order = require("../../models/order.model")
const Product = require("../../models/product.model")
const productsHelper = require("../../helpers/products")

//[GET] /orders
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    };

    // Lọc đơn hàng theo trạng thái
    const  status  = req.query.status;
    if(status){
        find.status = status;
    };


    const orders = await Order.find(find).lean();

    //Lấy thông tin tất cả sản phẩm trong các đơn hàng
    const productIds = [...new Set(orders.flatMap(order => order.products.map(product => product.product_id)))];
    const productsInfo = await Product.find({ _id: { $in: productIds } }).select("_id title thumbnail").lean();
    const productsInfoMap = new Map(productsInfo.map(product => [product._id.toString(), product]));

    // Trả về thông tin của từng đơn hàng
    const processedOrders = orders.map(order => {
        const processedProducts = order.products.map(product => {
            const productInfo = productsInfoMap.get(product.product_id.toString());
            const newPrice = productsHelper.newProductPrice(product);
            const totalProductPrice = product.quantity * newPrice;

            return {
                ...product,
                productInfo,
                newPrice,
                totalProductPrice
            };
        });

        const totalOrderPrice = processedProducts.reduce((sum, product) => sum + product.totalProductPrice, 0);

        return {
            id: order._id,  
            userInfo: order.userInfo,
            products: processedProducts,
            totalOrderPrice,
            status: order.status,
            createdAt: order.createdAt
        };
    });

    res.render("admin/pages/orders/index.pug",{
        pageTitle: "Quản lý đơn hàng",
        orders: processedOrders,
        status: status
    }
    )
}