const express = require("express");
const multer  = require('multer')
const router = express.Router();
const controller = require("../../controllers/admin/account.controller");
const validate = require("../../validates/admin/account.validate");
const upload = multer()
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")

router.get("/",controller.index);

router.get("/create",controller.create)

router.post("/create",
    upload.single('avatar'),
    uploadCloud.uploadCloud,
    validate.createPost,
    controller.createPost)


module.exports = router;