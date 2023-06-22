const express = require("express");
const router = express.Router();

const placeControllers = require("../controllers/placesController");

router.get("/user/:uid", placeControllers.getPlacesByUserID);

router.get("/:pid", placeControllers.getPlaceByID);

router.post("/", placeControllers.addPlace);

router.patch("/:pid", placeControllers.updatePlace);

router.delete("/:pid", placeControllers.deletePlace);

module.exports = router;
