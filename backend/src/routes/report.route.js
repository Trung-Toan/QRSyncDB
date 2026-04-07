const express = require("express");
const router = express.Router();

router.get("/", require("../controllers/report.controller").getReport);

module.exports = router;