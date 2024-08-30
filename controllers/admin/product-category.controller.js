const productCategory = require("../../models/product-category.model")
const systemConfig = require("../../config/system")
const createTree = require("../../helpers/createTree")
const filterStatusHelpers = require("../../helpers/filterStatus");
const searchHelpers = require("../../helpers/search");


//[GET] /admin/products-category
module.exports.index = async (req, res) => {
    try {
        
        let find = {
            deleted: false
        };

        const records = await productCategory.find(find);

        // Lọc sản phẩm theo trạng thái
        const filterStatus = filterStatusHelpers(req.query);
        const status = req.query.status;
        //Kết thúc lọc sản phẩm theo trạng thái

         //Tìm kiếm 
        const objectSearch = searchHelpers(req.query);
        // Kết thúc tìm kiếm 
        
        const newRecords = createTree.tree(records,"",status,  objectSearch.keywordRegex)

        //Số thứ tự danh mục
        let index = 1;
        const addIndex = (items) => {
            items.forEach(item => {
                item.index = index++;
                if (item.children) {
                    addIndex(item.children);
                }
            });
        };
        addIndex(newRecords);
        //Kết thúc số thứ tự danh mục
    
        res.render("admin/pages/products-category/index.pug",{
            pageTitle: "Danh mục sản phẩm",
            records: newRecords,
            filterStatus: filterStatus,
            keyword: objectSearch.keyword,
        });
    } catch (error) {
        req.flash("error","Yêu cầu của bạn không hợp lệ!");
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
 }

 //[GET] /admin/products-category/create
module.exports.create = async(req, res) => {

    let find = {
        deleted: false
    }

    const records = await productCategory.find(find);

    const newRecords = createTree.tree(records)
    
    res.render("admin/pages/products-category/create",{
        pageTitle: "Thêm mới danh mục sản phẩm",
        records: newRecords
    }  
    )
}

//[POST] /admin/products-category/create
module.exports.createPost = async(req, res) => {
    if(req.body.position == ""){
        const countProducts = await productCategory.countDocuments();
        req.body.position = countProducts + 1;
    }else{
        req.body.position = parseInt(req.body.position);
    }
    
    const record = new productCategory(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
}

 //[GET] /admin/products-category/edit/:id
 module.exports.edit = async(req, res) => {

    try {
        const id = req.params.id;
    
    const data = await productCategory.findOne({
        _id: id,
        deleted: false
    })

    const records = await productCategory.find({
        deleted: false
    });

    const newRecords = createTree.tree(records)

    res.render("admin/pages/products-category/edit",{
        pageTitle: "Cập nhật danh mục sản phẩm",
        data: data,
        records: newRecords
    }  
    )
    } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
    
}

//[PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async(req, res) => {
    
    try {
        const id = req.params.id
        req.body.position = parseInt(req.body.position);
        await productCategory.updateOne({ _id: id},req.body)
        req.flash("success","Cập nhật thành công")
    } catch (error) {
        req.flash("error","Cập nhật thất bại")

    }

    res.redirect(`back`);
}

//[GET] /admin/products-category/detail/:id
module.exports.detail = async(req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };
    
        const data = await productCategory.findOne(find);

        if (!data) {
            req.flash("error", "Không tìm thấy danh mục sản phẩm");
            return res.redirect(`${systemConfig.prefixAdmin}/products-category`);
        }

        let parentTitle = "";

        if (data.parent_id) {
            const parentId = data.parent_id;
            const parent = await productCategory.findOne({ _id: parentId });

            if (parent) {
                parentTitle = parent.title;
            } else {
                parentTitle = "Không tìm thấy danh mục cha";
            }
        } else {
            parentTitle = "Đây là danh mục cấp cao nhất.";
        }

        res.render("admin/pages/products-category/detail", {
            pageTitle: data.title,
            data: data,
            parentTitle: parentTitle
        });
    } catch (error) {
        req.flash("error", "Không tìm thấy sản phẩm");
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
};

//[DELETE] /admin/products-category/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await productCategory.updateOne({ _id: id}, { 
        deleted: true,
        deletedAt: new Date()
    });

    // Cập nhật lại data cho danh mục con
    const data = await productCategory.findOne({_id: id})
    await productCategory.updateMany({parent_id: id},{ $set: { parent_id: data.parent_id } } )

    req.flash('success', `Đã xóa thành công!`);
    res.redirect("back");
}

//[PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await productCategory.updateOne({ _id: id}, { status: status});
    req.flash('success', 'Cập nhật trạng thái thành công!');
    res.redirect("back");
}

//[PATCH] /admin/products-category/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
     
    switch (type) {
        case "active":
            await productCategory.updateMany({_id: {$in: ids}}, {status: "active"});
            req.flash('success', `Đã cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "inactive":
            await productCategory.updateMany({_id: {$in: ids}}, {status: "inactive"});
            req.flash('success', `Đã cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "delete-all":

            // Cập nhật lại danh mục cha cho các danh mục con
            for (const id of ids){
                const data = await productCategory.findOne({_id: id})
                await productCategory.updateMany({parent_id: id},{ $set: { parent_id: data.parent_id } } )
            }
            // Kết thúc cập nhật lại danh mục cha cho các danh mục con

            await productCategory.updateMany(
                {_id: {$in: ids}}, 
                {
                    deleted: true,
                    deletedAt: new Date()
                }
                );

            req.flash('success', `Đã xóa thành công ${ids.length} sản phẩm!`);
            break;
        case "change-position":
            for(const item of ids){
                let [id, position] = item.split("-");
                position = parseInt(position);
                

                await productCategory.updateOne({ _id: id},{
                    position: position
                });
            }
            req.flash('success', `Cập nhật thành công vị trí ${ids.length} sản phẩm!`);
            break;
    
        default:
            break;
    }

    res.redirect("back");
}