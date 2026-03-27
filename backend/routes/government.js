// const express = require("express");
// const router = express.Router();

// const {
//     governmentSignup,
//     governmentLogin,
//     getAllComplaints,
//     assignTask,
//     getDashboardStats,
//     getGovernmentProfile,
//     updateComplaintStatus,
// } = require("../controllers/government");

// const { isAuthenticated, isGovernment } = require("../middlewares/auth");

// // ✅ PUBLIC ROUTES (no auth required)
// router.post("/signup", governmentSignup);
// router.post("/login", governmentLogin);

// // ✅ PRIVATE ROUTES (auth + government only)
// router.get("/profile", isAuthenticated, isGovernment, getGovernmentProfile);
// router.get("/dashboard", isAuthenticated, isGovernment, getDashboardStats);
// router.get("/complaints", isAuthenticated, isGovernment, getAllComplaints);
// router.put("/complaint/:id/assign", isAuthenticated, isGovernment, assignTask);
// router.put("/complaint/:id/status", isAuthenticated, isGovernment, updateComplaintStatus);

// module.exports = router;
const express = require("express");
const router = express.Router();

const {
    governmentSignup,
    governmentLogin,
    getAllComplaints,
    assignTask,
    getDashboardStats,
    getGovernmentProfile,
    updateComplaintStatus,
    getAllVolunteers,             // ← ADDED: was missing, AssignTask page needs this
} = require("../controllers/government");

const { isAuthenticated, isGovernment } = require("../middlewares/auth");

// ✅ PUBLIC ROUTES
router.post("/signup", governmentSignup);
router.post("/login", governmentLogin);

// ✅ PRIVATE ROUTES
router.get("/profile", isAuthenticated, isGovernment, getGovernmentProfile);

// ← CHANGED: was /dashboard → now /stats
// dashboard calls GET https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/government/stats
router.get("/stats", isAuthenticated, isGovernment, getDashboardStats);

// ← CHANGED: was /complaints → now /complaints/all
// dashboard calls GET https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/government/complaints/all
router.get("/complaints/all", isAuthenticated, isGovernment, getAllComplaints);

// ← ADDED: volunteers list for AssignTask page
// dashboard calls GET https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/government/volunteers/all
router.get("/volunteers/all", isAuthenticated, isGovernment, getAllVolunteers);

// these two were correct, keeping as-is
router.put("/complaint/:id/assign", isAuthenticated, isGovernment, assignTask);
router.put("/complaint/:id/status", isAuthenticated, isGovernment, updateComplaintStatus);

module.exports = router;
