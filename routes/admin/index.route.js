const systemConfig = require("../../config/system")

const dashboardRoutes = require("./dashboard.route");


module.exports = (app) => {
    PATH_ADMIN = systemConfig.prefixAdmin;
    app.use(PATH_ADMIN + "/dashboard",dashboardRoutes);

    
}
 