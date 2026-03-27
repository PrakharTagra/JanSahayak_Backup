const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    logout,
    resetPassword,
    verifyEmail,
    resendVerification,
} = require("../controllers/auth");

const { isAuthenticated } = require("../middlewares/auth");

// ── Public routes (no auth required) ──────────────────────
router.post("/signup",               signup);
router.post("/login",                login);
router.get("/verify-email",          verifyEmail);          // GET /api/v1/auth/verify-email?token=...
router.post("/resend-verification",  resendVerification);   // POST with { email }
router.post("/reset-password",       resetPassword);

// ── Private routes (auth required) ────────────────────────
router.post("/logout", isAuthenticated, logout);

module.exports = router;