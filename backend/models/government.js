const mongoose = require("mongoose"); // ✅ this line was missing!

const governmentSchema = new mongoose.Schema(
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
        role: {
            type: String,
            default: "government",
        },
        designation: {
            type: String,
        },
        region: {
            type: String,
        },
        token: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Government || mongoose.model("Government", governmentSchema);