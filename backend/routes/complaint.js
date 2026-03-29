const express = require("express");
const router  = express.Router();

const {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    deleteComplaint,
    getMyComplaints,
    getUserDashboardStats,
    getFeed,
    toggleUpvote,
    getNearbyComplaints,
} = require("../controllers/complaint.js");

const { isAuthenticated, isGovernment } = require("../middlewares/auth");
const { upload } = require("../config/cloudinary");

// ── IMPORTANT: specific routes MUST come before /:id ─────────────────────────
// Express matches routes top-to-bottom. If /:id comes first, then
// GET /nearby → req.params.id = "nearby" → findById("nearby") → CastError 500
// GET /my/complaints → req.params.id = "my" → same problem
// GET /user/stats    → req.params.id = "user" → same problem
// Rule: every static path must be registered before any /:id wildcard.

// ── Public routes ─────────────────────────────────────────────────────────────
router.get("/feed",   getFeed);
router.get("/all",    getAllComplaints);
router.get("/nearby", isAuthenticated, getNearbyComplaints); // was using undefined `protect`

// ── Citizen — static paths first ─────────────────────────────────────────────
router.post("/create",         isAuthenticated, upload.single("photo"), createComplaint);
router.get("/my/complaints",   isAuthenticated, getMyComplaints);
router.get("/user/stats",      isAuthenticated, getUserDashboardStats);

// ── Wildcard /:id routes — always last ───────────────────────────────────────
router.get("/:id",             getComplaintById);
router.delete("/:id",          isAuthenticated, deleteComplaint);
router.put("/:id/upvote",      isAuthenticated, toggleUpvote);
router.put("/:id/status",      isAuthenticated, isGovernment, updateComplaintStatus);

module.exports = router;