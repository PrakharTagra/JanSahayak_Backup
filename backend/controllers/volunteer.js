const User = require("../models/user.js");
const Complaint = require("../models/complaint");
const Bid = require("../models/Bid"); // ✅ added

// ✅ REGISTER AS VOLUNTEER
exports.registerAsVolunteer = async (req, res) => {
    try {
        const { skills } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // check if already a volunteer
        if (user.isVolunteer) {
            return res.status(400).json({
                success: false,
                message: "You are already a volunteer",
            });
        }

        // update user to volunteer
        user.isVolunteer = true;
        user.role = "volunteer";
        user.volunteerDetails = {
            skills: skills || [],
            totalTasksCompleted: 0,
            rating: 0,
            isAvailable: true,
        };

        await user.save();

        // ✅ remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: "Registered as volunteer successfully",
            user: userResponse,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to register as volunteer",
            error: error.message,
        });
    }
};

// ✅ GET VOLUNTEER PROFILE
exports.getVolunteerProfile = async (req, res) => {
    try {
        const volunteer = await User.findById(req.user.id).select("-password");

        if (!volunteer || !volunteer.isVolunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer not found",
            });
        }

        return res.status(200).json({
            success: true,
            volunteer,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch volunteer profile",
            error: error.message,
        });
    }
};

// ✅ UPDATE VOLUNTEER PROFILE
exports.updateVolunteerProfile = async (req, res) => {
    try {
        const { skills, isAvailable } = req.body;

        const volunteer = await User.findById(req.user.id);

        if (!volunteer || !volunteer.isVolunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer not found",
            });
        }

        if (skills) volunteer.volunteerDetails.skills = skills;
        if (isAvailable !== undefined)
            volunteer.volunteerDetails.isAvailable = isAvailable;

        await volunteer.save();

        return res.status(200).json({
            success: true,
            message: "Volunteer profile updated successfully",
            volunteer,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update volunteer profile",
            error: error.message,
        });
    }
};

// ✅ GET ASSIGNED TASKS
exports.getAssignedTasks = async (req, res) => {
    try {
        const tasks = await Complaint.find({ assignedTo: req.user.id })
            .populate("postedBy", "name email")
            .populate("assignedBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch assigned tasks",
            error: error.message,
        });
    }
};

exports.acceptTask = async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        if (complaint.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "This task is not assigned to you",
            });
        }

        // ✅ status stays within allowed values
        complaint.status = "assigned";

        await complaint.save();

        await User.findByIdAndUpdate(req.user.id, {
            "volunteerDetails.isAvailable": false,
        });

        return res.status(200).json({
            success: true,
            message: "Task accepted successfully",
            complaint,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to accept task",
            error: error.message,
        });
    }
};

// ✅ MARK TASK AS RESOLVED
exports.markComplaintResolved = async (req, res) => {
    try {
        const { id } = req.params;
 
        const complaint = await Complaint.findById(id)
            .populate("assignedTo", "name volunteerDetails");
 
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }
        if (complaint.status === "resolved") {
            return res.status(400).json({ success: false, message: "Already resolved" });
        }
        if (complaint.status !== "assigned") {
            return res.status(400).json({ success: false, message: "Complaint must be assigned before resolving" });
        }
 
        complaint.status = "resolved";
        complaint.resolvedAt = new Date();
        await complaint.save();
 
        // increment volunteer task count + make available again
        if (complaint.assignedTo) {
            await User.findByIdAndUpdate(complaint.assignedTo._id, {
                $inc: { "volunteerDetails.totalTasksCompleted": 1 },
                "volunteerDetails.isAvailable": true,
            });
        }
 
        return res.status(200).json({
            success: true,
            message: "Complaint marked as resolved",
            complaint,
        });
 
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to resolve complaint",
            error: error.message,
        });
    }
};

// ✅ GET ALL VOLUNTEERS
exports.getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await User.find({ isVolunteer: true })
            .select("-password")
            .sort({ "volunteerDetails.rating": -1 });

        return res.status(200).json({
            success: true,
            count: volunteers.length,
            volunteers,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch volunteers",
            error: error.message,
        });
    }
};

// ✅ APPLY FOR COMPLAINT (volunteer applies with bid)
exports.applyForComplaint = async (req, res) => {
    try {
        const {
            complaintId,
            bankName,
            accountNumber,
            ifsc,
            accountHolder,
        } = req.body;

        // ✅ convert strings to numbers (FormData sends everything as string)
        const estimatedAmount = Number(req.body.estimatedAmount);
        const estimatedDays = Number(req.body.estimatedDays);

        // check all fields
        if (!complaintId || !estimatedAmount || !estimatedDays || !bankName || !accountNumber || !ifsc || !accountHolder) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // check selfie uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Selfie is required",
            });
        }
        
        const user = await User.findById(req.user.id);

        if (!user || !user.isVolunteer) {
            return res.status(403).json({
                success: false,
                message: "Only volunteers can apply",
            });
        }
        if (!user.volunteerDetails?.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "You are already assigned to a task",
            });
        }
        // check complaint exists
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        // check if already applied
        const existingBid = await Bid.findOne({
            complaint: complaintId,
            volunteer: req.user.id,
        });

        if (existingBid) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this complaint",
            });
        }

        // ✅ selfie cloudinary URL
        const selfieUrl = req.file.path;

        // create bid
        const bid = await Bid.create({
            complaint: complaintId,
            volunteer: req.user.id,
            estimatedAmount,
            estimatedDays,
            bankDetails: {
                accountHolder,
                bankName,
                accountNumber,
                ifsc,
            },
            selfie: selfieUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Volunteer application submitted successfully",
            bid,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit application",
            error: error.message,
        });
    }
};
exports.getBidsForComplaint = async (req, res) => {
    try {
        const { id } = req.params;
 
        const bids = await Bid.find({ complaint: id })
            .populate("volunteer", "name email phone volunteerDetails")
            .sort({ createdAt: -1 });
 
        return res.status(200).json({
            success: true,
            count: bids.length,
            bids,
        });
 
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bids",
            error: error.message,
        });
    }
};
exports.assignVolunteer = async (req, res) => {
    try {
        const { complaintId, volunteerId, bidId } = req.body;
 
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }
        if (complaint.assignedTo) {
            return res.status(400).json({ success: false, message: "Complaint already assigned" });
        }
 
        // assign volunteer + mark bid as accepted
        complaint.assignedTo = volunteerId;
        complaint.assignedBy = req.user.id;
        complaint.status = "assigned";
        if (bidId) complaint.approvedBid = bidId;
        await complaint.save();
 
        // reject all other bids for this complaint
        if (bidId) {
            await Bid.updateMany(
                { complaint: complaintId, _id: { $ne: bidId } },
                { status: "rejected" }
            );
            await Bid.findByIdAndUpdate(bidId, { status: "accepted" });
        }
 
        // make volunteer unavailable
        await User.findByIdAndUpdate(volunteerId, {
            "volunteerDetails.isAvailable": false,
        });
 
        const updated = await Complaint.findById(complaintId)
            .populate("assignedTo", "name email volunteerDetails")
            .populate("approvedBid");
 
        return res.status(200).json({
            success: true,
            message: "Volunteer assigned successfully",
            complaint: updated,
        });
 
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Assignment failed",
            error: error.message,
        });
    }
};
// controller
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ volunteer: req.user.id }).select("complaint");
    return res.status(200).json({ success: true, bids });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch bids", error: error.message });
  }
};