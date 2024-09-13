module.exports.order = (req, res, next) => {
    if(!req.body.fullName){
        req.flash('error', `Vui lòng nhập họ tên!`);
        res.redirect("back");
        return
    }

    if(!req.body.phone){
        req.flash('error', `Vui lòng nhập số điện thoại!`);
        res.redirect("back");
        return
    }

    if(!req.body.address){
        req.flash('error', `Vui lòng nhập địa chỉ!`);
        res.redirect("back");
        return
    }

    next();
}