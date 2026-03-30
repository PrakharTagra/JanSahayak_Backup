const ExcelJS = require("exceljs");
const User = require("../models/user");
const Complaint = require("../models/complaint");
const Bid = require("../models/Bid");

// ✅ helper to style header row
const styleHeader = (sheet) => {
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "1F3864" },
        };
        cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
    });
    headerRow.height = 25;
    sheet.views = [{ state: "frozen", ySplit: 1 }];
};

// ✅ helper to color status cells
const getStatusColor = (status) => {
    switch (status) {
        case "resolved":  return "70AD47"; // green
        case "assigned":  return "FFB900"; // amber
        case "pending":   return "FF0000"; // red
        case "accepted":  return "70AD47"; // green
        case "rejected":  return "FF0000"; // red
        default:          return "FFFFFF";
    }
};

// ✅ helper to add borders to row
const addBorders = (row) => {
    row.eachCell((cell) => {
        cell.border = {
            top:    { style: "thin", color: { argb: "DDDDDD" } },
            bottom: { style: "thin", color: { argb: "DDDDDD" } },
            left:   { style: "thin", color: { argb: "DDDDDD" } },
            right:  { style: "thin", color: { argb: "DDDDDD" } },
        };
    });
};

// ✅ EXPORT ALL DATA TO EXCEL
exports.exportToExcel = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "JanSahayak";
        workbook.created = new Date();

        // ────────────────────────────────────────────────────────────────────
        // SHEET 1: USERS
        // ────────────────────────────────────────────────────────────────────
        const usersSheet = workbook.addWorksheet("Users");
        usersSheet.columns = [
            { header: "Name",             key: "name",            width: 25 },
            { header: "Email",            key: "email",           width: 30 },
            { header: "Role",             key: "role",            width: 15 },
            { header: "Is Volunteer",     key: "isVolunteer",     width: 15 },
            { header: "Is Verified",      key: "isVerified",      width: 15 },
            { header: "Total Complaints", key: "totalComplaints", width: 20 },
            { header: "Joined On",        key: "createdAt",       width: 20 },
        ];
        styleHeader(usersSheet);

        const users = await User.find({}).select("-password");
        for (const user of users) {
            const totalComplaints = await Complaint.countDocuments({ postedBy: user._id });
            const row = usersSheet.addRow({
                name:           user.name,
                email:          user.email,
                role:           user.role,
                isVolunteer:    user.isVolunteer ? "Yes" : "No",
                isVerified:     user.isVerified ? "Yes" : "No",
                totalComplaints,
                createdAt:      user.createdAt?.toLocaleDateString("en-IN"),
            });
            addBorders(row);
        }
        usersSheet.autoFilter = "A1:G1";

        // ────────────────────────────────────────────────────────────────────
        // SHEET 2: VOLUNTEERS
        // ────────────────────────────────────────────────────────────────────
        const volunteersSheet = workbook.addWorksheet("Volunteers");
        volunteersSheet.columns = [
            { header: "Name",             key: "name",           width: 25 },
            { header: "Email",            key: "email",          width: 30 },
            { header: "Skills",           key: "skills",         width: 30 },
            { header: "Tasks Completed",  key: "tasksCompleted", width: 20 },
            { header: "Rating",           key: "rating",         width: 10 },
            { header: "Is Available",     key: "isAvailable",    width: 15 },
            { header: "Bank Name",        key: "bankName",       width: 20 },
            { header: "Account (Last 4)", key: "accountLast4",   width: 20 },
            { header: "Joined On",        key: "createdAt",      width: 20 },
        ];
        styleHeader(volunteersSheet);

        const volunteers = await User.find({ isVolunteer: true }).select("-password");
        for (const vol of volunteers) {
            const latestBid = await Bid.findOne({ volunteer: vol._id }).sort({ createdAt: -1 });
            const row = volunteersSheet.addRow({
                name:           vol.name,
                email:          vol.email,
                skills:         vol.volunteerDetails?.skills?.join(", ") || "N/A",
                tasksCompleted: vol.volunteerDetails?.totalTasksCompleted || 0,
                rating:         vol.volunteerDetails?.rating || 0,
                isAvailable:    vol.volunteerDetails?.isAvailable ? "Yes" : "No",
                bankName:       latestBid?.bankDetails?.bankName || "N/A",
                accountLast4:   latestBid?.bankDetails?.accountNumber
                    ? `****${latestBid.bankDetails.accountNumber.slice(-4)}`
                    : "N/A",
                createdAt:      vol.createdAt?.toLocaleDateString("en-IN"),
            });
            addBorders(row);
        }
        volunteersSheet.autoFilter = "A1:I1";

        // ────────────────────────────────────────────────────────────────────
        // SHEET 3: COMPLAINTS
        // ────────────────────────────────────────────────────────────────────
        const complaintsSheet = workbook.addWorksheet("Complaints");
        complaintsSheet.columns = [
            { header: "Title",           key: "title",          width: 30 },
            { header: "Category",        key: "category",       width: 20 },
            { header: "Location",        key: "location",       width: 25 },
            { header: "Status",          key: "status",         width: 15 },
            { header: "Reporter",        key: "reporter",       width: 25 },
            { header: "Assigned To",     key: "assignedTo",     width: 25 },
            { header: "Days to Resolve", key: "daysToResolve",  width: 18 },
            { header: "Upvotes",         key: "upvotes",        width: 10 },
            { header: "Filed On",        key: "createdAt",      width: 20 },
            { header: "Resolved On",     key: "resolvedAt",     width: 20 },
        ];
        styleHeader(complaintsSheet);

        const complaints = await Complaint.find({})
            .populate("postedBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });

        for (const c of complaints) {
            const daysToResolve = c.resolvedAt
                ? Math.ceil((new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24))
                : "Not resolved";

            const row = complaintsSheet.addRow({
                title:         c.title,
                category:      c.category,
                location:      c.location,
                status:        c.status,
                reporter:      c.postedBy?.name || "N/A",
                assignedTo:    c.assignedTo?.name || "Not Assigned",
                daysToResolve,
                upvotes:       c.upvotes?.length || 0,
                createdAt:     c.createdAt?.toLocaleDateString("en-IN"),
                resolvedAt:    c.resolvedAt?.toLocaleDateString("en-IN") || "N/A",
            });

            // ✅ color status cell
            const statusCell = row.getCell("status");
            statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: getStatusColor(c.status) },
            };
            statusCell.font = { bold: true, color: { argb: "FFFFFF" } };
            addBorders(row);
        }
        complaintsSheet.autoFilter = "A1:J1";

        // ────────────────────────────────────────────────────────────────────
        // SHEET 4: BIDS & PAYMENTS
        // ────────────────────────────────────────────────────────────────────
        const bidsSheet = workbook.addWorksheet("Bids & Payments");
        bidsSheet.columns = [
            { header: "Complaint Title",  key: "complaintTitle",  width: 30 },
            { header: "Volunteer Name",   key: "volunteerName",   width: 25 },
            { header: "Volunteer Email",  key: "volunteerEmail",  width: 30 },
            { header: "Estimated Amount", key: "amount",          width: 20 },
            { header: "Estimated Days",   key: "days",            width: 18 },
            { header: "Bank Name",        key: "bankName",        width: 20 },
            { header: "Account Holder",   key: "accountHolder",   width: 25 },
            { header: "Account Number",   key: "accountNumber",   width: 20 },
            { header: "IFSC Code",        key: "ifsc",            width: 15 },
            { header: "Status",           key: "status",          width: 15 },
            { header: "Applied On",       key: "createdAt",       width: 20 },
        ];
        styleHeader(bidsSheet);

        const bids = await Bid.find({})
            .populate("complaint", "title")
            .populate("volunteer", "name email")
            .sort({ createdAt: -1 });

        for (const bid of bids) {
            const row = bidsSheet.addRow({
                complaintTitle: bid.complaint?.title || "N/A",
                volunteerName:  bid.volunteer?.name  || "N/A",
                volunteerEmail: bid.volunteer?.email || "N/A",
                amount:         `₹${bid.estimatedAmount}`,
                days:           bid.estimatedDays,
                bankName:       bid.bankDetails?.bankName       || "N/A",
                accountHolder:  bid.bankDetails?.accountHolder  || "N/A",
                accountNumber:  bid.bankDetails?.accountNumber  || "N/A",
                ifsc:           bid.bankDetails?.ifsc           || "N/A",
                status:         bid.status,
                createdAt:      bid.createdAt?.toLocaleDateString("en-IN"),
            });

            // ✅ color status cell
            const statusCell = row.getCell("status");
            statusCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: getStatusColor(bid.status) },
            };
            statusCell.font = { bold: true, color: { argb: "FFFFFF" } };
            addBorders(row);
        }
        bidsSheet.autoFilter = "A1:K1";

        // ────────────────────────────────────────────────────────────────────
        // SHEET 5: SUMMARY
        // ────────────────────────────────────────────────────────────────────
        const summarySheet = workbook.addWorksheet("Summary");
        summarySheet.columns = [
            { header: "Metric", key: "metric", width: 35 },
            { header: "Value",  key: "value",  width: 25 },
        ];
        styleHeader(summarySheet);

        // calculate all metrics
        const totalComplaints    = await Complaint.countDocuments();
        const resolvedComplaints = await Complaint.countDocuments({ status: "resolved" });
        const pendingComplaints  = await Complaint.countDocuments({ status: "pending" });
        const assignedComplaints = await Complaint.countDocuments({ status: "assigned" });
        const totalUsers         = await User.countDocuments({ isVolunteer: false });
        const totalVolunteers    = await User.countDocuments({ isVolunteer: true });
        const totalBids          = await Bid.countDocuments();
        const acceptedBids       = await Bid.countDocuments({ status: "accepted" });
        const rejectedBids       = await Bid.countDocuments({ status: "rejected" });

        const resolutionRate = totalComplaints > 0
            ? ((resolvedComplaints / totalComplaints) * 100).toFixed(2) + "%"
            : "0%";

        const resolvedWithDate = await Complaint.find({
            status: "resolved",
            resolvedAt: { $ne: null },
        });

        const avgDays = resolvedWithDate.length > 0
            ? (resolvedWithDate.reduce((sum, c) => {
                return sum + Math.ceil(
                    (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)
                );
            }, 0) / resolvedWithDate.length).toFixed(1)
            : "N/A";

        const acceptedBidsList = await Bid.find({ status: "accepted" });
        const totalPayout = acceptedBidsList.reduce((sum, b) => sum + (b.estimatedAmount || 0), 0);

        const topCategoryData = await Complaint.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
        ]);
        const topCategory = topCategoryData[0]?._id || "N/A";

        const summaryData = [
            { metric: "Total Complaints",       value: totalComplaints },
            { metric: "Resolved Complaints",    value: resolvedComplaints },
            { metric: "Pending Complaints",     value: pendingComplaints },
            { metric: "Assigned Complaints",    value: assignedComplaints },
            { metric: "Resolution Rate",        value: resolutionRate },
            { metric: "Avg Days to Resolve",    value: avgDays },
            { metric: "Total Citizens",         value: totalUsers },
            { metric: "Total Volunteers",       value: totalVolunteers },
            { metric: "Total Bids",             value: totalBids },
            { metric: "Accepted Bids",          value: acceptedBids },
            { metric: "Rejected Bids",          value: rejectedBids },
            { metric: "Total Payout (₹)",       value: `₹${totalPayout}` },
            { metric: "Top Complaint Category", value: topCategory },
            { metric: "Export Generated On",    value: new Date().toLocaleString("en-IN") },
            { metric: "Generated By",           value: "JanSahayak Authority Portal" },
        ];

        summaryData.forEach((item) => {
            const row = summarySheet.addRow(item);
            addBorders(row);
        });

        // ── Send Excel file as download ────────────────────────────────────────
        const fileName = `JanSahayak_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to export Excel",
            error: error.message,
        });
    }
};