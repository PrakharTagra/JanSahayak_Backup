const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ storage configuration
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "jansahayak",
        allowed_formats: ["jpeg", "jpg", "png", "webp"],
        transformation: [{ width: 800, height: 600, crop: "limit" }],
    }),
});

// ✅ multer instance
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { cloudinary, upload };