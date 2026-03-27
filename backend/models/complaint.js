const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ["garbage", "bad_road", "broken_light", "other", "waterlogging"],
            default: null,
        },
       upvotes: [{ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: "User", 
  default: [] 
}],
        location: { type: String, required: true, trim: true },
        photo: { type: String },
        status: {
            type: String,
            enum: ["pending","assigned","resolved"],
            default: "pending",
        },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Government", default: null },
        approvedBid: { type: mongoose.Schema.Types.ObjectId, ref: "Bid", default: null },
        resolvedAt: { type: Date, default: null },
    },
    { timestamps: true }
);
module.exports = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);