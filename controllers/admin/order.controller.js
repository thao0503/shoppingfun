const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const mongoose = require('mongoose');
const productsHelper = require("../../helpers/products");
const systemConfig = require("../../config/system")

//[GET] /orders
module.exports.index = async (req, res) => {
    //Kiểm tra quyền truy cập
    const permissions = res.locals.userRole.permissions;
    if (!permissions.includes("orders_view")) {
        return res.status(403).render("admin/errors/403.pug", {
            message: "Bạn không có quyền truy cập vào trang này."
        });
    };

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
};

//[GET] /orders/detail/:orderId
module.exports.detail = async (req,res) => {
    //Kiểm tra quyền truy cập
    const permissions = res.locals.userRole.permissions;
    if (!permissions.includes("orders_view")) {
        return res.status(403).render("admin/errors/403.pug", {
            message: "Bạn không có quyền truy cập vào trang này."
        });
    };

    try {
        const orderId = req.params.orderId;
        const order = await Order.findOne({
            _id: orderId
        });
        
        // Lấy thông tin về sản phẩm trong đơn hàng
        for (const product of order.products) {
            const productInfo = await Product.findOne({
                _id: product.product_id
            }).select("title thumbnail").lean();
    
            product.productInfo = productInfo;
            product.newPrice = productsHelper.newProductPrice(product);
            product.totalProductPrice = product.quantity * product.newPrice;
        };
    
        order.totalOrderPrice = order.products.reduce((sum,product) => sum + product.totalProductPrice ,0);

         // Lấy thông tin người cập nhật gần nhất
         if(order.updatedBy.length > 0){
            const updatedBy = order.updatedBy.slice(-1)[0];
            if(updatedBy){
                const userUpdate = await Account.findOne({
                    _id: updatedBy.account_id
                });
   
                updatedBy.userFullName = userUpdate.fullName;
            };
         };
         
        res.render("admin/pages/orders/detail.pug",{
            pageTitle: "Chi tiết đơn hàng",
            order: order
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
};

//[PATCH] /orders/update-status/:orderId
module.exports.updateStatusOrder = async (req, res) => {

    //Kiểm tra quyền truy cập
    const permissions = res.locals.userRole.permissions;
    if (!permissions.includes("orders_edit")) {
       return;
    };
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const status = req.body.status;
        const orderId = req.params.orderId;

        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };

        const order = await Order.findById(orderId).session(session);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        const oldStatus = order.status;
        
        // Cập nhật số lượng sản phẩm
        if (status === 'confirmed' && oldStatus === 'pending') {
            // Giảm số lượng sản phẩm khi xác nhận đơn hàng
            for (const item of order.products) {
                const product = await Product.findById(item.product_id).session(session);
                if (!product || product.stock < item.quantity) {
                    throw new Error(`Không đủ số lượng cho sản phẩm ${product ? product.name : 'không xác định'}`);
                }
                await Product.updateOne(
                    { _id: item.product_id },
                    { $inc: { stock: -item.quantity } }
                ).session(session);
            };
        } else if (status === 'cancelled' && ['pending', 'confirmed','shipping'].includes(oldStatus)) {
            // Khôi phục số lượng sản phẩm khi hủy đơn hàng
            for (const item of order.products) {
                await Product.updateOne(
                    { _id: item.product_id },
                    { $inc: { stock: item.quantity } }
                ).session(session);
            };
        };

        // Cập nhật trạng thái đơn hàng
        order.status = status;
        order.updatedBy.push(updatedBy);
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        req.flash("success", "Cập nhật đơn hàng thành công!");
        res.redirect("back");
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        req.flash("error","Có lỗi xảy ra khi cập nhật đơn hàng");
        res.redirect("back");
    }
};

//[PATCH] /orders/update-status-orders
module.exports.updateStatusOrders = async (req, res) => {
    const { status, ids } = req.body;
    const orderIds = ids.split(', ');

    if (!res.locals.userRole.permissions.includes("orders_edit")) {
        return res.status(403).json({ error: "Không có quyền thực hiện thao tác này" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };

        const orders = await Order.find({ _id: { $in: orderIds } }).session(session);

        if (orders.length !== orderIds.length) {
            throw new Error("Một số đơn hàng không tồn tại");
        }

        const stockUpdates = [];
        const orderUpdates = [];

        for (const order of orders) {
            const oldStatus = order.status;
            
            if (status === 'confirmed' && oldStatus === 'pending') {
                stockUpdates.push(...order.products.map(item => ({
                    updateOne: {
                        filter: { _id: item.product_id },
                        update: { $inc: { stock: -item.quantity } }
                    }
                })));
            } else if (status === 'cancelled' && ['pending', 'confirmed', 'shipping'].includes(oldStatus)) {
                stockUpdates.push(...order.products.map(item => ({
                    updateOne: {
                        filter: { _id: item.product_id },
                        update: { $inc: { stock: item.quantity } }
                    }
                })));
            }

            orderUpdates.push({
                updateOne: {
                    filter: { _id: order._id },
                    update: { 
                        $set: { status },
                        $push: { updatedBy }
                    }
                }
            });
        }

        if (stockUpdates.length > 0) {
            await Product.bulkWrite(stockUpdates, { session });
        }

        await Order.bulkWrite(orderUpdates, { session });

        await session.commitTransaction();
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
};