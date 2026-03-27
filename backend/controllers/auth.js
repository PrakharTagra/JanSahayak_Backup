const User = require("../models/user.js");
const Government = require("../models/government.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("../config/nodemailer");
const { verificationTemplate, welcomeTemplate } = require("../templates/emailTemplates");
const dotenv = require("dotenv");
dotenv.config();

// ─────────────────────────────────────────────
// ✅ SIGNUP  (Citizens only)
// ─────────────────────────────────────────────
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // ✅ Don't pass volunteerDetails at all — Mongoose will use schema defaults
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isVolunteer: false,
            isVerified: false,
            verificationToken,
            verificationTokenExpiry,
        });

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        await sendMail({
            to: email,
            subject: "Verify your JanSahayak account",
            html: verificationTemplate(name, verifyUrl),
        });

        return res.status(201).json({
            success: true,
            message: "Account created. Please check your email to verify your account before logging in.",
        });

    } catch (error) {
        console.error("SIGNUP ERROR:", error); // ← shows exact error in terminal
        return res.status(500).json({
            success: false,
            message: "Signup failed",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// ✅ VERIFY EMAIL
// ─────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is missing",
            });
        }

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification link",
            });
        }

        if (user.verificationTokenExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Verification link has expired. Please request a new one.",
            });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        await user.save();

        await sendMail({
            to: user.email,
            subject: "Welcome to JanSahayak!",
            html: welcomeTemplate(user.name),
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in.",
        });

    } catch (error) {
        console.error("VERIFY EMAIL ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Verification failed",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// ✅ RESEND VERIFICATION EMAIL
// ─────────────────────────────────────────────
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = verificationTokenExpiry;
        await user.save();

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        await sendMail({
            to: email,
            subject: "Verify your JanSahayak account",
            html: verificationTemplate(user.name, verifyUrl),
        });

        return res.status(200).json({
            success: true,
            message: "Verification email resent. Please check your inbox.",
        });

    } catch (error) {
        console.error("RESEND ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Could not resend verification email",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// ✅ LOGIN
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, password and role are required",
            });
        }

        let user = null;

        if (role === "authority") {
            user = await Government.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Authority not found. Please contact admin.",
                });
            }

            if (user.password !== password) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
            }

        } else {
            user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found. Please signup first.",
                });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
            }

            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your email before logging in. Check your inbox or request a new verification link.",
                    isVerified: false,
                });
            }
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        user = user.toObject();
        delete user.password;
        delete user.verificationToken;
        delete user.verificationTokenExpiry;

        const cookieOptions = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        return res.cookie("token", token, cookieOptions).status(200).json({
            success: true,
            message: "Login successful",
            token,
            role: role,
            user,
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// ✅ LOGOUT
// ─────────────────────────────────────────────
exports.logout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Logout failed", error: error.message });
    }
};

// ─────────────────────────────────────────────
// ✅ RESET PASSWORD
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: "Email and new password are required" });
        }

        let user = await User.findOne({ email }) || await Government.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Password reset failed", error: error.message });
    }
};