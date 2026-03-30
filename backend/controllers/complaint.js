const Complaint = require("../models/complaint");
const User = require("../models/user");

// ✅ Create Complaint
exports.createComplaint = async (req, res) => {
    try {
        const { title, description, location, category } = req.body;

        if (!title || !description || !location || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const photo = req.file ? req.file.path : null;

        const complaint = await Complaint.create({
            title,
            description,
            category,
            location,
            photo,
            postedBy: req.user?._id,
        });

        return res.status(201).json({
            success: true,
            message: "Complaint created successfully",
            complaint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating complaint",
            error: error.message,
        });
    }
};

// ✅ Get All Complaints
// exports.getAllComplaints = async (req, res) => {
//     try {
//         const complaints = await Complaint.aggregate([
//             {
//                 $addFields: { upvoteCount: { $size: { $ifNull: ["$upvotes", []] } } }
//             },
//             { $sort: { upvoteCount: -1, createdAt: -1 } },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "postedBy",
//                     foreignField: "_id",
//                     as: "postedBy",
//                     pipeline: [{ $project: { name: 1, email: 1 } }]
//                 }
//             },
//             {
//                 $unwind: { path: "$postedBy", preserveNullAndEmptyArrays: true }
//             }
//         ]);

//         return res.status(200).json({
//             success: true,
//             complaints,
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Error fetching complaints",
//             error: error.message,
//         });
//     }
// };

// complaint controller — getAllComplaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("postedBy", "name email phone")
      .populate("assignedTo", "name email phone volunteerDetails")
      .populate({
        path: "approvedBid",
        populate: { path: "volunteer", select: "name email phone volunteerDetails" }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

// ✅ Get Complaint by ID
exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate("postedBy", "name email")
            .populate("assignedTo", "name email")
            .populate("assignedBy", "name email")
            .populate("approvedBid");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        return res.status(200).json({
            success: true,
            complaint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching complaint",
        });
    }
};

// ✅ Update Complaint Status (Government)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, assignedTo } = req.body;

        // ← FIXED: was "authority" — your JWT stores role as "government"
        if (req.user.role !== "government") {
            return res.status(403).json({
                success: false,
                message: "Only government authority can update complaint status",
            });
        }

        // ← ADDED: validate status value
        const validStatuses = ["pending", "assigned", "inProgress", "resolved"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        complaint.status = status;

        // ← ADDED: support assigning volunteer from this route too
        if (assignedTo) {
            complaint.assignedTo = assignedTo;
            complaint.assignedBy = req.user.id;
        }

        if (status === "resolved") {
            complaint.resolvedAt = new Date();

            // ← ADDED: free volunteer + increment their task count on resolve
            if (complaint.assignedTo) {
                await User.findByIdAndUpdate(complaint.assignedTo, {
                    "volunteerDetails.isAvailable": true,
                    $inc: { "volunteerDetails.totalTasksCompleted": 1 },
                });
            }
        }

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            complaint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating status",
            error: error.message,
        });
    }
};

// ✅ Delete Complaint (Citizen)
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        if (complaint.postedBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await complaint.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Complaint deleted",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting complaint",
        });
    }
};

// ✅ Get My Complaints
exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ postedBy: req.user.id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            complaints,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user complaints",
        });
    }
};

// ✅ Dashboard Stats (Citizen)
exports.getUserDashboardStats = async (req, res) => {
    try {
        const total = await Complaint.countDocuments({ postedBy: req.user.id });
        const resolved = await Complaint.countDocuments({ postedBy: req.user.id, status: "resolved" });
        const pending = await Complaint.countDocuments({ postedBy: req.user.id, status: "pending" });

        return res.status(200).json({
            success: true,
            stats: { total, resolved, pending },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching stats",
        });
    }
};

// ✅ Feed (Public latest complaints)
exports.getFeed = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("postedBy", "name")
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            complaints,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching feed",
        });
    }
};

// ✅ Toggle Upvote
exports.toggleUpvote = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        const userId = req.user.id;
        const alreadyUpvoted = complaint.upvotes.includes(userId);

        if (alreadyUpvoted) {
            complaint.upvotes = complaint.upvotes.filter(
                (id) => id.toString() !== userId
            );
        } else {
            complaint.upvotes.push(userId);
        }

        await complaint.save();

        return res.status(200).json({
            success: true,
            upvoteCount: complaint.upvotes.length,
            upvoted: !alreadyUpvoted,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error toggling upvote",
            error: error.message,
        });
    }
};