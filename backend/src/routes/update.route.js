const express = require("express");
const router = express.Router();

router.patch("/:id", require("../controllers/payment.controller").update);

module.exports = router;