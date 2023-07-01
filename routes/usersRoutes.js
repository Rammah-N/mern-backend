const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const fileUpload = require("../middleware/fileUpload");

const usersControllers = require("../controllers/userController");

router.get("/", usersControllers.getUsers);
router.post(
	"/signup",
	fileUpload.single("image"),
	[
		check("name").not().isEmpty(),
		check("email").isEmail(),
		check("password").isLength({ min: 6 }),
	],
	usersControllers.signup
);
router.post("/login", usersControllers.login);

module.exports = router;
