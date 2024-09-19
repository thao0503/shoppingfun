const homeRoutes = require("./home.route");
const productRoutes = require("./product.route");
const searchRoutes = require("./search.route");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route");
const userRoutes = require("./user.route");
const categoryMiddleware = require("../../middlewares/client/category.middleware")
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const userMiddleware = require("../../middlewares/client/user.middleware");
const generalSettingMiddleware = require("../../middlewares/client/generalSettings.middeware");

module.exports = (app) => {
    app.use(categoryMiddleware.category);

    app.use(cartMiddleware.loadOrCreateCart);

    app.use(userMiddleware.userInfo);

    app.use(generalSettingMiddleware.generalSetting);

    app.use("/",homeRoutes);

    app.use("/products",productRoutes);
    
    app.use("/search",searchRoutes);

    app.use("/cart",cartRoutes);

    app.use("/checkout",checkoutRoutes);

    app.use("/user",userRoutes);

}
 