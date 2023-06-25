const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const HttpError = require("../models/httpError");

const places = [
	{
		id: "1",
		title: "Building 1",
		description: "building",
		location: {
			lat: 40.7484474,
			lng: -73.9871516,
		},
		address: "address",
		creator: "u1",
	},
	{
		id: "2",
		title: "Building 2",
		description: "building",
		location: {
			lat: 40.7484474,
			lng: -73.9871516,
		},
		address: "address",
		creator: "u1",
	},
	{
		id: "3",
		title: "Building 3",
		description: "building",
		location: {
			lat: 40.7484474,
			lng: -73.9871516,
		},
		address: "address",
		creator: "u2",
	},
	{
		id: "4",
		title: "Building 4",
		description: "building",
		location: {
			lat: 40.7484474,
			lng: -73.9871516,
		},
		address: "address",
		creator: "u4",
	},
];

function getPlaceByID(req, res, next) {
	const pid = req.params.pid;
	const place = places.find((p) => p.id === pid);

	if (!place) {
		return next(new HttpError("Could not find a place with this id", 404));
	}
	res.json({ place });
}

function getPlacesByUserID(req, res, next) {
	const uid = req.params.uid;
	const userPlaces = places.filter((p) => p.creator === uid);
	if (userPlaces.length === 0) {
		throw new HttpError("Could not find a place for the current user", 404);
	}
	res.json({ userPlaces });
}

function addPlace(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422).json(errors);
	}

	const { title, description, location, address, creator } = req.body;

	const newPlace = {
		id: uuid(),
		title,
		description,
		location,
		address,
		creator,
	};

	places.push(newPlace);
	res.status(201).json({ place: newPlace });
}

function updatePlace(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422).json(errors);
	}

	const pid = req.params.pid;
	const newPlace = req.body;
	const index = places.find((p) => p.id === pid);

	places[index] = newPlace;

	res.status(200).json({ place: newPlace });
}

function deletePlace(req, res, next) {
	const pid = req.params.id;
	const index = places.find((p) => p.id === pid);
	if (index >= 0) {
		places.splice(index, 1);
		res.status(200).json({ message: "Place was deleted successfully " });
	}
	throw new HttpError("Could not find a place", 400);
}

exports.getPlaceByID = getPlaceByID;
exports.getPlacesByUserID = getPlacesByUserID;
exports.addPlace = addPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
