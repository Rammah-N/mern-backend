const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/httpError");
const placesRoutes = require("./routes/placesRoutes");
const usersRoutes = require("./routes/usersRoutes");
const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
	const error = new HttpError("Route not found", 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}

	res.status(error.code || 500);
	res.json({ message: error.message || "An unknown error occured" });
});

mongoose
	.connect(
		"mongodb+srv://rammah:Webdev12@cluster0.8ai5ikj.mongodb.net/places?retryWrites=true&w=majority"
	)
	.then(() => {
		app.listen(5000);
	})
	.catch((err) => {
		console.log(err);
	});