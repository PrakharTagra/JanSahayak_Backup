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

// ✅ Specific static routes FIRST
router.get("/feed", getFeed);
router.get("/all", getAllComplaints);
router.get("/my/complaints", isAuthenticated, getMyComplaints);   // moved up
router.get("/user/stats", isAuthenticated, getUserDashboardStats); // moved up

// ✅ Dynamic :id routes LAST
router.get("/:id", getComplaintById);
router.post("/create", isAuthenticated, upload.single("photo"), createComplaint);
router.delete("/:id", isAuthenticated, deleteComplaint);
router.put("/:id/upvote", isAuthenticated, toggleUpvote);
router.put("/:id/status", isAuthenticated, isGovernment, updateComplaintStatus);

module.exports = router;