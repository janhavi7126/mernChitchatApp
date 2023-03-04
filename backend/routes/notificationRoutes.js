const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { route } = require("./userRoutes");
const router = express.Router();


// router.route("/").get(protect,fetchNotification)

module.exports = router;