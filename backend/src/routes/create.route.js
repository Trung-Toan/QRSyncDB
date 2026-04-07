const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

router.post("/", upload.single('file'), require("../controllers/payment.controller").create);

router.post("/daily-cash", require("../controllers/daily_cash.controller").create);

module.exports = router;