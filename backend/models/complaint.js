const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        title:       { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },

        category: {
            type: String,
            enum: ["garbage", "bad_road", "broken_light", "other", "waterlogging"],
            default: null,
        },

        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],

        // ── Location ───────────────────────────────────────────────────────────
        // Human-readable address label (reverse-geocoded on the client)
        location: { type: String, required: true, trim: true },

        // GeoJSON point — enables $near / $geoWithin queries and map plotting
        geoLocation: {
            type: {
                type:        { type: String, enum: ["Point"], required: true },
                coordinates: { type: [Number], required: true }, // [longitude, latitude]
            },
            required: true,
        },

        // Raw accuracy reading from the device GPS (metres)
        // Anything above 200 m is rejected at the controller level
        gpsAccuracyM: { type: Number, required: true },

        // ── Photo ──────────────────────────────────────────────────────────────
        photo: { type: String },

        // ── Timestamps (server-side only — never trust the client clock) ───────
        // capturedAt = when we received the request; createdAt (from timestamps:true)
        // is identical but kept explicit here for clarity in queries.
        capturedAt: { type: Date, required: true },   // set to Date.now() in the controller

        // ── Workflow ───────────────────────────────────────────────────────────
        status: {
            type:    String,
            enum:    ["pending", "assigned", "resolved"],
            default: "pending",
        },

        postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User",       required: true },
        assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: "User",       default: null  },
        assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "Government", default: null  },
        approvedBid: { type: mongoose.Schema.Types.ObjectId, ref: "Bid",        default: null  },
        resolvedAt:  { type: Date, default: null },
    },
    { timestamps: true }
);

// 2dsphere index — required for all geospatial queries ($near, $geoWithin, etc.)
complaintSchema.index({ geoLocation: "2dsphere" });

// Useful compound indexes for the authority dashboard
complaintSchema.index({ status: 1, capturedAt: -1 });
complaintSchema.index({ category: 1, status: 1 });

module.exports = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);