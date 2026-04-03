const express = require("express");
const router = express.Router();

const createRoute = require("./create.route");
const detailRoute = require("./detail.route");
const listRoute = require("./list.route");
const updateRoute = require("./update.route");

router.use("/create", createRoute);
router.use("/detail", detailRoute);
router.use("/list", listRoute);
router.use("/update", updateRoute);

module.exports = router;