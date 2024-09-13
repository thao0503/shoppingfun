const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/checkout.controller")
const checkoutValidate = require("../../validates/client/checkout.validate")

router.get("/",controller.index);

router.post("/order",checkoutValidate.order,controller.order);

router.get("/success/:orderId",controller.successOrder);

module.exports = router;