const express = require("express");
const router = express.Router();

router.get("/", require("../controllers/payment.controller").getList);

router.get("/daily-cash", require("../controllers/daily_cash.controller").getList);

module.exports = router;