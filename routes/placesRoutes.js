const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const fileUpload = require("../middleware/fileUpload");

const auth = require("../middleware/auth");
const placeControllers = require("../controllers/placesController");

router.get("/user/:uid", placeControllers.getPlacesByUserID);

router.get("/:pid", placeControllers.getPlaceByID);

router.use(auth);

router.post(
	"/",
	fileUpload.single("image"),
	[
		check("title").not().isEmpty(),
		check("description").isLength({ min: 5 }),
		check("address").not().isEmpty(),
	],
	placeControllers.addPlace
);

router.patch(
	"/:pid",
	[check("title").not().isEmpty(), check("description").isLength({ min: 5 })],

	placeControllers.updatePlace
);

router.delete("/:pid", placeControllers.deletePlace);

module.exports = router;
