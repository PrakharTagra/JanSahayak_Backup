const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // Forward image to Python ML service
    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path), req.file.originalname);

    const mlResponse = await axios.post(
      process.env.ML_SERVICE_URL || "http://localhost:5001/predict",
      form,
      { headers: form.getHeaders() }
    );

    const { category, confidence, all_scores } = mlResponse.data;

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      category,
      confidence,
      all_scores,
    });

  } catch (error) {
    console.error("Classification error:", error.message);
    res.status(500).json({ success: false, message: "Classification failed" });
  }
});

module.exports = router;