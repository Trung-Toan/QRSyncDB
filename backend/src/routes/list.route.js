const express = require("express");
const router = express.Router();

router.get("/", require("../controllers/payment.controller").getList);

module.exports = router;