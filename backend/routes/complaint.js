const express = require("express");
const router = express.Router();

const {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    deleteComplaint,
    getMyComplaints,
    // getComplaintsByCategory,
    getUserDashboardStats,
    getFeed,
    toggleUpvote,  // ✅ add this
} = require("../controllers/complaint.js");

const { isAuthenticated, isGovernment } = require("../middlewares/auth");
const { upload } = require("../config/cloudinary");

// ✅ PUBLIC ROUTES
router.get("/feed", getFeed);
router.get("/all", getAllComplaints);
// router.get("/category/:category", getComplaintsByCategory);
router.get("/:id", getComplaintById);

// ✅ CITIZEN ROUTES
router.post("/create", isAuthenticated, upload.single("photo"), createComplaint);
router.get("/my/complaints", isAuthenticated, getMyComplaints);
router.get("/user/stats", isAuthenticated, getUserDashboardStats);
router.delete("/:id", isAuthenticated, deleteComplaint);
router.put("/:id/upvote", isAuthenticated, toggleUpvote);  // ✅ add this

// ✅ GOVERNMENT ROUTES
router.put("/:id/status", isAuthenticated, isGovernment, updateComplaintStatus);

module.exports = router;