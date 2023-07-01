const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");

const HttpError = require("../models/httpError");
const User = require("../models/user");

async function getUsers(req, res, next) {
	let users;
	try {
		users = await User.find({}, "-password");
	} catch (error) {
		return next(
			new HttpError("There was a problem on our side, please try again later"),
			500
		);
	}
	res.status(200).json(users.map((user) => user.toObject({ getters: true })));
}

async function signup(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422).json(errors);
	}

	const { name, email, password } = req.body;
	let emailExists;
	try {
		emailExists = await User.findOne({ email });
	} catch (err) {
		const error = new HttpError(
			"Signing up failed, please try again later",
			500
		);
		return next(error);
	}

	if (emailExists) {
		const error = new HttpError(
			"Email already exists, please use a different email",
			422
		);
		return next(error);
	}

	let newUser;
	try {
		newUser = new User({
			name,
			email,
			password,
			image: req.file.path,
			places: [],
		});

		await newUser.save();
	} catch (err) {
		return next(HttpError("Signing up failed, please try again later", 500));
	}

	res.status(201).json({ user: newUser.toObject({ getters: true }) });
}

async function login(req, res, next) {
	const { email, password } = req.body;
	let userExists;
	try {
		userExists = await User.findOne({ email });
	} catch (error) {
		return next(new HttpError("Login failed, please try again later,", 500));
	}

	if (!userExists || password !== userExists.password) {
		const error = new HttpError(
			"User not found or credentials are wrong, please try again.",
			401
		);
		return next(error);
	}

	res.status(200).json({
		message: "User logged in successfully",
		user: userExists.toObject({ getters: true }),
	});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
