const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },

        // ✅ Email verification
        isVerified: {
            type: Boolean,
            default: false,         // false until user clicks the link
        },
        verificationToken: {
            type: String,
            default: null,          // UUID stored here after signup
        },
        verificationTokenExpiry: {
            type: Date,
            default: null,          // token expires after 24 hours
        },

        isVolunteer: {
            type: Boolean,
            default: false,         // false = citizen, true = volunteer
        },

        // Only populated when isVolunteer = true
        volunteerDetails: {
            skills: {
                type: [String],
                default: [],
            },
            totalTasksCompleted: {
                type: Number,
                default: 0,
            },
            rating: {
                type: Number,
                default: 0,
            },
            isAvailable: {
                type: Boolean,
                default: true,
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);