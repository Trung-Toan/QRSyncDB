const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

router.post("/", upload.single('file'), require("../controllers/payment.controller").create);

module.exports = router;