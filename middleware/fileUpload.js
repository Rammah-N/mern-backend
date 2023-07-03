const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v4: uuid } = require("uuid");
const cloudinary = require("cloudinary").v2;

const MIME_TYPE_MAP = (type) => {
	if (!type) {
		return null;
	}
	return type.split("/")[1];
};

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_KEY,
	api_secret: process.env.CLOUD_SECRET,
});

// Create a storage engine using CloudinaryStorage
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "uploads", // Specify the folder in Cloudinary where you want to store the files
		allowedFormats: ["jpg", "jpeg", "png"], // Specify the allowed file formats
	},
});

const fileUpload = multer({
	limits: 500000,
	storage: storage,
	fileFilter: (req, file, cb) => {
		const isValid = !!MIME_TYPE_MAP(file.mimetype);
		let error = isValid ? null : new Error("Invalid file type!");
		cb(error, isValid);
	},
});

// Custom middleware to attach Cloudinary URL to req object
const attachCloudinaryURL = (req, res, next) => {
	// If a file was uploaded, extract the Cloudinary URL and attach it to req object
	if (req.file) {
		req.cloudinaryUrl = req.file.path;
	}
	next();
};

module.exports = { fileUpload, attachCloudinaryURL };
