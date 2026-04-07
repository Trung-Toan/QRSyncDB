const express = require("express");
const router = express.Router();

router.get("/daily-cash/:id", require("../controllers/daily_cash.controller").getDetail);

router.get("/:id", require("../controllers/payment.controller").getDetail);

module.exports = router;