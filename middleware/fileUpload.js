const multer = require("multer");
const uuid = require("uuid").v4;

const MIME_TYPE_MAP = (type) => {
	if (!type) {
		return null;
	}
	return type.split("/")[1];
};

const fileUpload = multer({
	limits: 500000,
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, "tmp");
		},
		filename: (req, file, cb) => {
			const ext = MIME_TYPE_MAP(file.mimetype);
			cb(null, uuid() + "." + ext);
		},
	}),
	fileFilter: (req, file, cb) => {
		const isValid = !!MIME_TYPE_MAP(file.mimetype);
		let error = isValid ? null : new Error("Invalid file type!");
		cb(error, isValid);
	},
});

module.exports = fileUpload;
