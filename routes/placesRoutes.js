const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const placeControllers = require("../controllers/placesController");

router.get("/user/:uid", placeControllers.getPlacesByUserID);

router.get("/:pid", placeControllers.getPlaceByID);

router.post(
	"/",
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
