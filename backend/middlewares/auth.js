const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const Government = require("../models/government");
const dotenv = require("dotenv");
dotenv.config();

// ✅ AUTH MIDDLEWARE - check if user is logged in
exports.isAuthenticated = async (req, res, next) => {
    try {
        // extract token from cookie or header
        const token =
            req.cookies.token ||
            req.header("Authorization")?.replace("Bearer ", "");

        // check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login first",
            });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find user from token (check both User and Government)
        let user = await User.findById(decoded.id);
        if (!user) {
            user = await Government.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // set user in request
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token is invalid or expired",
            error: error.message,
        });
    }
};

// ✅ IS VOLUNTEER
exports.isVolunteer = async (req, res, next) => {
    try {
        if (!req.user.isVolunteer) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Volunteers only",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authorization failed",
            error: error.message,
        });
    }
};

// ✅ IS GOVERNMENT
// exports.isGovernment = async (req, res, next) => {
//     try {
//         if (req.user.role !== "government") {
//             return res.status(403).json({
//                 success: false,
//                 message: "Access denied: Government only",
//             });
//         }
//         next();
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Authorization failed",
//             error: error.message,
//         });
//     }
// };
exports.isGovernment = async (req, res, next) => {
    try {
        const isGov = 
            req.user.constructor.modelName === "Government" ||
            req.user.role === "government";

        if (!isGov) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Government only",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authorization failed",
            error: error.message,
        });
    }
};