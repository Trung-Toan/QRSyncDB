const express = require("express");
const router = express.Router();

const createRoute = require("./create.route");
const detailRoute = require("./detail.route");
const listRoute = require("./list.route");

router.use("/create", createRoute);
router.use("/detail", detailRoute);
router.use("/list", listRoute);

module.exports = router;