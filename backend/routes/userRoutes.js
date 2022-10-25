const express = require("express");
const { registerUser, authUser ,allUser} = require("../controllers/userController");
const router = express.Router();
const {protect} = require("../middlewares/authMiddleware")

router.route("/").get(protect,allUser);
router.route("/").post(registerUser)
router.post("/login",authUser);

module.exports = router;