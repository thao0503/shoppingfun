const express = require("express");
const router = express.Router();
const validate = require("../../validates/admin/role.validate");
const controller = require("../../controllers/admin/role.controller");

router.get("/",controller.index);

router.get("/create",controller.create)

router.post("/create",controller.createPost)

router.get("/edit/:id",controller.edit)

router.patch("/edit/:id",
    validate.createPost,
    controller.editPatch)

module.exports = router;