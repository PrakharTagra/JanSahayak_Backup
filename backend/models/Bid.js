const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
    {
        complaint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint",
            required: true,
        },
        volunteer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        estimatedAmount: {
            type: Number,
            required: true,
        },
        estimatedDays: {
            type: Number,
            required: true,
        },
        bankDetails: {
            accountHolder: { type: String, required: true },
            bankName: { type: String, required: true },
            accountNumber: { type: String, required: true },
            ifsc: { type: String, required: true },
        },
        selfie: {
            type: String, // cloudinary URL
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Bid || mongoose.model("Bid", bidSchema);