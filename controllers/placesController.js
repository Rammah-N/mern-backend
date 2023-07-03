const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Place = require("../models/place");
const User = require("../models/user");
const fs = require("fs");
const HttpError = require("../models/httpError");

async function getPlaceByID(req, res, next) {
	const pid = req.params.pid;
	let place;
	try {
		place = await Place.findById(pid);
	} catch (err) {
		return next(new HttpError("Something went wrong, please try again", 500));
	}

	if (!place) {
		return next(new HttpError("Could not find a place with this id", 404));
	}
	res.json({ place: place.toObject({ getters: true }) });
}

async function getPlacesByUserID(req, res, next) {
	const uid = req.params.uid;

	let user;
	try {
		user = await User.findById(uid).populate("places");
	} catch (err) {
		return next(new HttpError("Something went wrong, please try again", 500));
	}
	if (!user || user.places.length === 0) {
		return next(
			new HttpError("Could not find a place for the current user", 404)
		);
	}

	res.json(user.places.map((place) => place.toObject({ getters: true })));
}

async function addPlace(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422).json(errors);
	}

	const { title, description, location, address, creator } = req.body;
	let user;

	try {
		user = await User.findById(creator);
	} catch (error) {
		return next(
			new HttpError(
				"There was a problem on our side, please try again later",
				500
			)
		);
	}

	if (!user) {
		return next(
			new HttpError(
				"Couldn't find user with provided Id, please try again",
				500
			)
		);
	}

	const newPlace = new Place({
		title,
		description,
		image: req.cloudinaryUrl ? req.cloudinaryUrl : null,
		address,
		location: location || {
			lat: 25.1957339,
			lng: 55.2659489,
		},
		creator: req.userData.userId,
	});

	try {
		const session = await mongoose.startSession();
		session.startTransaction();
		await newPlace.save({ session });
		user.places.push(newPlace);
		await user.save({ session });
		await session.commitTransaction();
	} catch (err) {
		return next(
			new HttpError("Place could not be saved, please try again", 500)
		);
	}

	res.status(201).json({ place: newPlace });
}

async function updatePlace(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(422).json(errors);
	}
	const pid = req.params.pid;
	const { title, description } = req.body;
	let place;
	try {
		place = await Place.findById(pid);
	} catch (err) {
		return next(
			new HttpError("Error updating place, please try again later", 500)
		);
	}
	if (place.creator.toString() !== req.userData.userId) {
		return next(
			new HttpError("You are not authorized to modify this item!", 401)
		);
	}

	place.title = title;
	place.description = description;
	try {
		await place.save();
	} catch (err) {
		return next(
			new HttpError("Error updating place, please try again later", 500)
		);
	}
	res.status(200).json({ place });
}

async function deletePlace(req, res, next) {
	const pid = req.params.pid;
	let place;

	try {
		place = await Place.findById(pid).populate("creator");
	} catch (err) {
		return next(
			new HttpError(
				"There was a problem on our side, please try again later",
				500
			)
		);
	}

	if (!place) {
		return next(
			new HttpError(
				"Couldn't find place with provided Id, please try again",
				404
			)
		);
	}
	if (place.creator.id !== req.userData.userId) {
		return next(
			new HttpError("You are not authorized to modify this item!", 401)
		);
	}

	const imagePath = place.image;

	try {
		const session = await mongoose.startSession();
		session.startTransaction();
		await place.deleteOne({ session });
		await place.creator.places.pull(place);
		await place.creator.save({ session });
		await session.commitTransaction();
	} catch (err) {
		console.log(err);
		return next(
			new HttpError("Error deleting place, please try again later"),
			404
		);
	}
	fs.unlink(imagePath, (err) => {});
	res.status(200).json({ message: "Place was deleted successfully " });
}

exports.getPlaceByID = getPlaceByID;
exports.getPlacesByUserID = getPlacesByUserID;
exports.addPlace = addPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
