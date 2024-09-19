const GeneralSetting = require("../../models/general-settings.model");

module.exports.generalSetting = async (req, res, next) => {
    const generalSetting = await GeneralSetting.findOne({});
    
    res.locals.generalSetting = generalSetting;
    next();
};