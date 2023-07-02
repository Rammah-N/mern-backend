const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError(
			"Could not create user, please try again.",
			500
		);
		return next(error);
	}

	let newUser;
	try {
		newUser = new User({
			name,
			email,
			password: hashedPassword,
			image: req.file.path,
			places: [],
		});

		await newUser.save();
	} catch (err) {
		return next(HttpError("Signing up failed, please try again later", 500));
	}

	let token;
	try {
		token = jwt.sign({ userId: newUser.id, email }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});
	} catch (err) {
		return next(HttpError("Signing up failed, please try again later", 500));
	}

	res.status(201).json({
		user: {
			id: newUser.id,
			email: newUser.email,
			token,
		},
	});
}

async function login(req, res, next) {
	const { email, password } = req.body;
	let existingUser;
	try {
		existingUser = await User.findOne({ email });
	} catch (error) {
		return next(new HttpError("Login failed, please try again later,", 500));
	}

	if (!existingUser) {
		const error = new HttpError("User not found, please try again.", 401);
		return next(error);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (err) {
		return next(new HttpError("Could not log you in, please try again", 500));
	}

	if (!isValidPassword) {
		return next(
			new HttpError(
				"Wrong password, please enter the correct password and try again"
			)
		);
	}
	let token;
	try {
		token = jwt.sign(
			{ userId: existingUser.id, email: existingUser.email },
			process.env.JWT_SECRET,
			{
				expiresIn: "1h",
			}
		);
	} catch (err) {
		return next(HttpError("Signing in failed, please try again later", 500));
	}

	res.status(200).json({
		message: "User logged in successfully",
		user: {
			id: existingUser.id,
			email: existingUser.email,
			token,
		},
	});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
