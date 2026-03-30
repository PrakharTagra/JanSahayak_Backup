const Government = require("../models/government.js");
const Complaint = require("../models/complaint.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// ✅ GOVERNMENT SIGNUP
exports.governmentSignup = async (req, res) => {
    try {
        const { name, email, password, designation, region } = req.body;

        const existingUser = await Government.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Government user already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const government = await Government.create({
            name,
            email,
            password: hashedPassword,
            designation,
            region,
            role: "government",
        });

        return res.status(201).json({
            success: true,
            message: "Government user registered successfully",
            government,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Signup failed",
            error: error.message,
        });
    }
};

// ✅ GOVERNMENT LOGIN
exports.governmentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const government = await Government.findOne({ email });
        if (!government) {
            return res.status(404).json({
                success: false,
                message: "Government user not found",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, government.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { id: government._id, email: government.email, role: government.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        let govData = government.toObject();
        delete govData.password;

        const options = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        return res.cookie("token", token, options).status(200).json({
            success: true,
            message: "Government login successful",
            token,
            government: govData,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

// ✅ GET ALL COMPLAINTS
// Dashboard uses: GET /complaint/all
// Supports optional ?status= and ?category= query filters
exports.getAllComplaints = async (req, res) => {
    try {
        const { status, category } = req.query;

        let filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;

        const complaints = await Complaint.find(filter)
            .populate("postedBy", "name email")
            .populate("assignedTo", "name email volunteerDetails")
            .populate("assignedBy", "name designation")   // ← added designation for display
            .populate("approvedBid")                      // ← added for bid system
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

// ✅ ASSIGN TASK TO VOLUNTEER
// Dashboard uses: PUT /complaint/:id/assign
// Body: { volunteerId }
// - Marks complaint as "assigned"
// - Sets assignedTo + assignedBy
// - Marks volunteer as unavailable
exports.assignTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { volunteerId } = req.body;

        if (!volunteerId) {
            return res.status(400).json({
                success: false,
                message: "volunteerId is required",
            });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        // ← CHANGED: allow re-assign only if still pending (not inProgress)
        if (complaint.status === "resolved") {
            return res.status(400).json({
                success: false,
                message: `Cannot assign — complaint is already ${complaint.status}`,
            });
        }

        const volunteer = await User.findOne({
            _id: volunteerId,
            isVolunteer: true,
            "volunteerDetails.isAvailable": true,
        });

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer not found or not available",
            });
        }

        complaint.assignedTo = volunteerId;
        complaint.assignedBy = req.user.id;
        complaint.status = "assigned";
        await complaint.save();

        volunteer.volunteerDetails.isAvailable = false;
        await volunteer.save();

        // ← ADDED: return populated complaint so dashboard can update UI instantly
        const populated = await Complaint.findById(id)
            .populate("postedBy", "name email")
            .populate("assignedTo", "name email volunteerDetails")
            .populate("assignedBy", "name designation");

        return res.status(200).json({
            success: true,
            message: "Task assigned successfully",
            complaint: populated,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to assign task",
            error: error.message,
        });
    }
};

// ✅ UPDATE COMPLAINT STATUS
// Dashboard uses: PUT /complaint/:id/status
// Body: { status }   — "assigned" | "inProgress" | "resolved"
// - On resolved: sets resolvedAt, frees volunteer, increments tasksCompleted
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "assigned", "resolved"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        complaint.status = status;

        if (status === "resolved") {
            complaint.resolvedAt = new Date();

            if (complaint.assignedTo) {
                // ← ADDED: increment tasksCompleted when resolved
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
            message: "Failed to update status",
            error: error.message,
        });
    }
};

// ✅ GET DASHBOARD STATS
// Dashboard uses: GET /complaint/stats
// Returns counts for all 4 status values + volunteer availability
// ← ADDED: categoryBreakdown renamed to complaintsByCategory for consistency
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalComplaints,
            pendingComplaints,
            assignedComplaints,
            resolvedComplaints,
            totalVolunteers,
            availableVolunteers,
            complaintsByCategory,
        ] = await Promise.all([
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: "pending" }),
            Complaint.countDocuments({ status: "assigned" }),
            Complaint.countDocuments({ status: "resolved" }),
            User.countDocuments({ isVolunteer: true }),
            User.countDocuments({ isVolunteer: true, "volunteerDetails.isAvailable": true }),
            Complaint.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalComplaints,
                pendingComplaints,
                assignedComplaints,
                resolvedComplaints,
                totalVolunteers,
                availableVolunteers,
                complaintsByCategory,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats",
            error: error.message,
        });
    }
};

// ✅ GET ALL VOLUNTEERS
// Dashboard uses: GET /volunteer/all
// AssignTask page fetches this to populate applicant cards
// ← NEW: was missing from original controller
exports.getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await User.find({ isVolunteer: true })
            .select("name email volunteerDetails")
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

// ✅ GET GOVERNMENT PROFILE
exports.getGovernmentProfile = async (req, res) => {
    try {
        const government = await Government.findById(req.user.id).select("-password");

        if (!government) {
            return res.status(404).json({
                success: false,
                message: "Government user not found",
            });
        }

        return res.status(200).json({
            success: true,
            government,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message,
        });
    }
};