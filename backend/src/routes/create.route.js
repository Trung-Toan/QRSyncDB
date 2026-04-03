const express = require("express");
const router = express.Router();

router.post("/", require("../controllers/payment.controller").create);

module.exports = router;