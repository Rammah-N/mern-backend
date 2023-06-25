const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const HttpError = require("../models/httpError");

const users = [
	{
		id: "1",
		name: "John Doe",
		email: "test@test.com",
		password: "1234",
	},
];

function getUsers(req, res, next) {
	res.status(200).json({ users });
}

function signup(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422).json(errors);
	}

	const { name, email, password } = req.body;
	if (users.find((user) => user.email === email)) {
		throw new HttpError(
			"This email already exists, please use a new one.",
			422
		);
	}

	const newUser = {
		id: uuid(),
		name,
		email,
		password,
	};

	users.push(newUser);
	res.status(201).json({ user: newUser });
}

function login(req, res, next) {
	const { email, password } = req.body;

	const userExists = users.find(
		(u) => u.email === email && u.password === password
	);
	if (!userExists) {
		const error = new HttpError(
			"User not found or credentials are wrong, please try again.",
			401
		);
		throw error;
	}

	res.status(200).json({ message: "User logged in successfully" });
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
