const express = require("express");
const router = express.Router();

const {
    registerAsVolunteer,
    getVolunteerProfile,
    updateVolunteerProfile,
    getAssignedTasks,
    markComplaintResolved,
    getAllVolunteers,
    applyForComplaint,
    getBidsForComplaint,
    assignVolunteer,
    acceptTask,
    getMyBids
} = require("../controllers/volunteer.js");

const {
    isAuthenticated,
    isVolunteer,
    isGovernment,
} = require("../middlewares/auth");

const upload = require("../middlewares/upload"); // ✅ added (multer + cloudinary)

// ✅ PUBLIC ROUTES (no auth required)
router.get("/all", getAllVolunteers);

// ✅ CITIZEN ROUTES (auth + citizen only)
router.post("/register", isAuthenticated, registerAsVolunteer);

// ✅ VOLUNTEER ROUTES (auth + volunteer only)
router.get("/profile", isAuthenticated, isVolunteer, getVolunteerProfile);
router.put("/profile", isAuthenticated, isVolunteer, updateVolunteerProfile);
router.get("/tasks", isAuthenticated, isVolunteer, getAssignedTasks);
router.put("/complaint/:id/resolve", isAuthenticated, isGovernment, markComplaintResolved);
router.get("/complaint/:id/bids", isAuthenticated, isGovernment, getBidsForComplaint);
router.post("/assign", isAuthenticated, isGovernment, assignVolunteer);
router.put("/task/:id/accept", isAuthenticated, isVolunteer, acceptTask)
router.get("/my-bids", isAuthenticated, getMyBids);

// ✅ APPLY FOR COMPLAINT (auth + volunteer + selfie upload)
router.post("/apply", isAuthenticated, isVolunteer, upload.single("selfie"), applyForComplaint);

module.exports = router;