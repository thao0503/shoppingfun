const GeneralSetting = require("../../models/general-settings.model")

// [GET] /admin/settings/general
module.exports.general = async (req, res) => {

    const generalSetting = await GeneralSetting.findOne({});

    res.render("admin/pages/settings/general.pug",{
        pageTitle: "Cài đặt chung",
        generalSetting: generalSetting
    });
};

// [PATCH] /admin/settings/general
module.exports.generalPatch = async (req, res) => {

    const generalSetting = await GeneralSetting.findOne({});
    if(generalSetting){
        await GeneralSetting.updateOne({
            _id: generalSetting.id
        },
            req.body
        )
        req.flash("success","Cập nhật thành công!")
    }else{
        const record = new GeneralSetting(req.body);
        await record.save();
    }
    
    res.redirect("back");
};