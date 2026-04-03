const express = require("express");
const router = express.Router();

router.get("/:id", require("../controllers/payment.controller").getDetail);

module.exports = router;