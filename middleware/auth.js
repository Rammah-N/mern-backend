const jwt = require("jsonwebtoken");

const HttpError = require("../models/httpError");

module.exports = (req, res, next) => {
	if (req.method === "OPTIONS") {
		return next();
	}

	try {
		const token = req.headers.authorization.split(" ")[1];

		if (!token) {
			throw new Error("Authentication failed!");
		}

		const decodedToken = jwt.verify(token, "bajbaj");
		req.userData = { userId: decodedToken.userId };
		next();
	} catch (err) {
		const error = new HttpError("Authorization failed, please log in ", 401);
		return next(error);
	}
};
