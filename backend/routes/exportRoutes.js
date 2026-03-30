const express = require("express");
const router = express.Router();

const { exportToExcel } = require("../controllers/exportController");
const { isAuthenticated, isGovernment } = require("../middlewares/auth");

// ✅ only government can export
router.get("/export", isAuthenticated, isGovernment, exportToExcel);

module.exports = router;