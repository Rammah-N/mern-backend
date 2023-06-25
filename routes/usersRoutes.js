const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const usersControllers = require("../controllers/userController");

router.get("/", usersControllers.getUsers);
router.post(
	"/signup",
	[
		check("name").not().isEmpty(),
		check("email").isEmail(),
		check("password").isLength({ min: 8 }),
	],
	usersControllers.signup
);
router.post("/login", usersControllers.login);

module.exports = router;
