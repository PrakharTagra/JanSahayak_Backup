// routes/exportRoutes.js
// GET /api/v1/authority/export
// Authority-only. Returns a 5-sheet .xlsx with Users, Volunteers,
// Complaints, Bids/Payments, and a Summary sheet.

const express = require("express");
const router  = express.Router();
const ExcelJS = require("exceljs");

// ── import your existing models ──────────────────────────────────────────────
const User       = require("../models/user");
const Government = require("../models/government");
const Complaint  = require("../models/complaint");
const Bid        = require("../models/Bid");

// ── import your existing auth middleware ─────────────────────────────────────
const { isAuthenticated, isGovernment } = require("../middleware/authMiddleware");

// ── colour palette (matches JanSahayak amber/dark theme) ────────────────────
const C = {
  headerBg:     "FF1A2D4A",
  headerFont:   "FFFFFFFF",
  subheaderBg:  "FF0D1F3C",
  amber:        "FFFF9933",
  green:        "FF22C55E",
  amber_light:  "FFFFF3E0",
  green_light:  "FFF0FFF4",
  red_light:    "FFFFF1F1",
  blue_light:   "FFE6F1FB",
  purple_light: "FFEEEDFE",
  border:       "FFD1D5DB",
  row_even:     "FFF8FAFC",
  row_odd:      "FFFFFFFF",
};

// ── helper: apply header row style ──────────────────────────────────────────
function styleHeader(row, bgColor = C.headerBg) {
  row.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: C.headerFont }, size: 10, name: "Arial" };
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border    = {
      top:    { style: "thin", color: { argb: C.border } },
      bottom: { style: "thin", color: { argb: C.border } },
      left:   { style: "thin", color: { argb: C.border } },
      right:  { style: "thin", color: { argb: C.border } },
    };
  });
  row.height = 28;
}

// ── helper: style a source-hint row (grey, italic) ──────────────────────────
function styleSourceRow(row) {
  row.eachCell(cell => {
    cell.font      = { italic: true, color: { argb: "FF9CA3AF" }, size: 8, name: "Arial" };
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: C.subheaderBg } };
    cell.alignment = { horizontal: "center" };
  });
  row.height = 16;
}

// ── helper: style a data row ─────────────────────────────────────────────────
function styleDataRow(row, idx) {
  const bg = idx % 2 === 0 ? C.row_even : C.row_odd;
  row.eachCell({ includeEmpty: true }, cell => {
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
    cell.font      = { size: 10, name: "Arial" };
    cell.alignment = { vertical: "middle", wrapText: false };
    cell.border    = {
      bottom: { style: "hair", color: { argb: C.border } },
      right:  { style: "hair", color: { argb: C.border } },
    };
  });
  row.height = 20;
}

// ── helper: set column widths ────────────────────────────────────────────────
function setCols(sheet, cols) {
  sheet.columns = cols.map(({ header, key, width }) => ({ header, key, width }));
}

// ── helper: status badge colour ─────────────────────────────────────────────
function statusArgb(status) {
  const map = {
    resolved:   C.green_light,
    assigned:   C.blue_light,
    pending:    C.amber_light,
    active:     C.green_light,
    busy:       C.amber_light,
    available:  C.green_light,
    unverified: C.red_light,
    accepted:   C.green_light,   // ✅ fixed
    rejected:   C.red_light,     // ✅ fixed
  };
  return map[(status || "").toLowerCase()] || C.row_odd;
}


// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/export", isAuthenticated, isGovernment, async (req, res) => {
  try {

    // ── 1. Fetch all data in parallel ────────────────────────────────────────
    const [users, complaints, bids] = await Promise.all([
      User.find({}).lean(),

      Complaint.find({})
        .populate("postedBy",   "name email phone")
        .populate("assignedTo", "name email phone volunteerDetails")
        .populate("approvedBid")
        .lean(),

      Bid.find({})
        .populate("volunteer", "name email phone volunteerDetails")
        .populate("complaint", "title _id")
        .lean(),
    ]);

    // volunteers are Users with isVolunteer: true
    const volunteers = await User.find({ isVolunteer: true }).lean();

    // ── 2. Build workbook ────────────────────────────────────────────────────
    const wb = new ExcelJS.Workbook();
    wb.creator  = "JanSahayak Authority Portal";
    wb.created  = new Date();
    wb.modified = new Date();


    // ════════════════════════════════════════════════════════════════════════
    // SHEET 1 — USERS
    // ════════════════════════════════════════════════════════════════════════
    const wsUsers = wb.addWorksheet("Users", {
      properties: { tabColor: { argb: C.amber } },
    });

    setCols(wsUsers, [
      { key: "user_id",          header: "User ID",          width: 28 },
      { key: "full_name",        header: "Full Name",         width: 22 },
      { key: "email",            header: "Email",             width: 28 },
      { key: "email_verified",   header: "Email Verified",    width: 16 },
      { key: "role",             header: "Role",              width: 12 },
      { key: "registered_on",    header: "Registered On",     width: 18 },
      { key: "total_complaints", header: "Total Complaints",  width: 18 },
      { key: "pending_count",    header: "Pending",           width: 12 },
      { key: "resolved_count",   header: "Resolved",          width: 12 },
      { key: "account_status",   header: "Account Status",    width: 16 },
    ]);

    styleHeader(wsUsers.getRow(1));
    styleSourceRow(
      wsUsers.addRow([
        "auth/signup · _id", "name", "email", "isVerified",
        "role", "createdAt", "stats.total", "stats.pending",
        "stats.resolved", "active/unverified",
      ])
    );

    // count complaints per user
    const complaintsByUser = {};
    complaints.forEach(c => {
      const uid = c.postedBy?._id?.toString();
      if (!uid) return;
      if (!complaintsByUser[uid]) complaintsByUser[uid] = { total: 0, pending: 0, resolved: 0 };
      complaintsByUser[uid].total++;
      if (c.status === "pending")  complaintsByUser[uid].pending++;
      if (c.status === "resolved") complaintsByUser[uid].resolved++;
    });

    users.forEach((u, i) => {
      const counts = complaintsByUser[u._id.toString()] || { total: 0, pending: 0, resolved: 0 };
      const status = u.isVerified ? "Active" : "Unverified";
      const row = wsUsers.addRow({
        user_id:          u._id.toString(),
        full_name:        u.name  || "—",
        email:            u.email || "—",
        email_verified:   u.isVerified ? "Yes" : "No",
        role:             u.role  || "user",
        registered_on:    u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—",
        total_complaints: counts.total,
        pending_count:    counts.pending,
        resolved_count:   counts.resolved,
        account_status:   status,
      });
      styleDataRow(row, i);

      if (!u.isVerified) {
        row.getCell("account_status").fill = {
          type: "pattern", pattern: "solid", fgColor: { argb: C.red_light },
        };
      }
    });

    wsUsers.autoFilter = { from: "A1", to: "J1" };
    wsUsers.views = [{ state: "frozen", ySplit: 2 }];


    // ════════════════════════════════════════════════════════════════════════
    // SHEET 2 — VOLUNTEERS
    // ════════════════════════════════════════════════════════════════════════
    const wsVols = wb.addWorksheet("Volunteers", {
      properties: { tabColor: { argb: "FF22C55E" } },
    });

    setCols(wsVols, [
      { key: "volunteer_id",   header: "Volunteer ID",     width: 28 },
      { key: "full_name",      header: "Full Name",        width: 22 },
      { key: "email",          header: "Email",            width: 28 },
      { key: "phone",          header: "Phone",            width: 16 },
      { key: "skills",         header: "Skills",           width: 24 },
      { key: "tasks_assigned", header: "Tasks Assigned",   width: 16 },
      { key: "tasks_completed",header: "Tasks Completed",  width: 16 },
      { key: "rating",         header: "Rating",           width: 10 },
      { key: "is_available",   header: "Available?",       width: 12 },
      { key: "bank_name",      header: "Bank Name",        width: 18 },
      { key: "account_last4",  header: "Account (last 4)", width: 16 },
      { key: "ifsc",           header: "IFSC Code",        width: 16 },
      { key: "account_holder", header: "Account Holder",   width: 22 },
      { key: "joined_on",      header: "Joined On",        width: 18 },
      { key: "status",         header: "Status",           width: 14 },
    ]);

    styleHeader(wsVols.getRow(1));
    styleSourceRow(
      wsVols.addRow([
        "_id", "name", "email", "phone", "volunteerDetails.skills[]",
        "bids count", "totalTasksCompleted", "rating", "isAvailable",
        "bankDetails.bankName", "accountNumber.slice(-4)", "ifsc",
        "accountHolder", "createdAt", "busy/available",
      ])
    );

    // grab bank details from their most recent ACCEPTED bid ✅ fixed
    const bankByVol = {};
    bids.forEach(b => {
      if (b.status === "accepted" && b.volunteer?._id) {
        bankByVol[b.volunteer._id.toString()] = b.bankDetails || {};
      }
    });

    // count bids per volunteer
    const bidsByVol = {};
    bids.forEach(b => {
      const vid = b.volunteer?._id?.toString();
      if (vid) bidsByVol[vid] = (bidsByVol[vid] || 0) + 1;
    });

    volunteers.forEach((v, i) => {
      const bank   = bankByVol[v._id.toString()] || {};
      const vd     = v.volunteerDetails || {};
      const busy   = !vd.isAvailable;
      const status = busy ? "Busy" : "Available";

      const row = wsVols.addRow({
        volunteer_id:    v._id.toString(),
        full_name:       v.name  || "—",
        email:           v.email || "—",
        phone:           v.phone || "—",
        skills:          (vd.skills || []).filter(Boolean).join(", ") || "—",
        tasks_assigned:  bidsByVol[v._id.toString()] || 0,
        tasks_completed: vd.totalTasksCompleted || 0,
        rating:          vd.rating ? `${vd.rating}★` : "N/A",
        is_available:    busy ? "No" : "Yes",
        bank_name:       bank.bankName || "—",
        account_last4:   bank.accountNumber ? `••••${bank.accountNumber.slice(-4)}` : "—",
        ifsc:            bank.ifsc    || "—",
        account_holder:  bank.accountHolder || "—",
        joined_on:       v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-IN") : "—",
        status,
      });
      styleDataRow(row, i);

      row.getCell("status").fill = {
        type: "pattern", pattern: "solid",
        fgColor: { argb: busy ? C.amber_light : C.green_light },
      };
    });

    wsVols.autoFilter = { from: "A1", to: "O1" };
    wsVols.views = [{ state: "frozen", ySplit: 2 }];


    // ════════════════════════════════════════════════════════════════════════
    // SHEET 3 — COMPLAINTS
    // ════════════════════════════════════════════════════════════════════════
    const wsComp = wb.addWorksheet("Complaints", {
      properties: { tabColor: { argb: "FF60A5FA" } },
    });

    setCols(wsComp, [
      { key: "complaint_id",   header: "Complaint ID",       width: 28 },
      { key: "title",          header: "Title",              width: 30 },
      { key: "category",       header: "Category",           width: 16 },
      { key: "description",    header: "Description",        width: 40 },
      { key: "location",       header: "Location",           width: 24 },
      { key: "photo_url",      header: "Photo URL",          width: 30 },
      { key: "reported_by",    header: "Reported By",        width: 22 },
      { key: "reporter_email", header: "Reporter Email",     width: 28 },
      { key: "reporter_phone", header: "Reporter Phone",     width: 16 },
      { key: "filed_on",       header: "Filed On",           width: 16 },
      { key: "assigned_to",    header: "Assigned Volunteer", width: 22 },
      { key: "vol_email",      header: "Volunteer Email",    width: 28 },
      { key: "vol_phone",      header: "Volunteer Phone",    width: 16 },
      { key: "status",         header: "Status",             width: 14 },
      { key: "resolved_on",    header: "Resolved On",        width: 16 },
      { key: "days_to_resolve",header: "Days to Resolve",    width: 16 },
    ]);

    styleHeader(wsComp.getRow(1));
    styleSourceRow(
      wsComp.addRow([
        "_id", "title", "category", "description", "location", "photo",
        "postedBy.name", "postedBy.email", "postedBy.phone", "createdAt",
        "assignedTo.name", "assignedTo.email", "assignedTo.phone",
        "status", "resolvedAt", "resolvedAt − createdAt",
      ])
    );

    complaints.forEach((c, i) => {
      let daysToResolve = "—";
      if (c.resolvedAt && c.createdAt) {
        const diff = Math.round(
          (new Date(c.resolvedAt) - new Date(c.createdAt)) / 86400000
        );
        daysToResolve = diff === 0 ? "Same day" : `${diff}d`;
      }

      const row = wsComp.addRow({
        complaint_id:    c._id.toString(),
        title:           c.title       || "—",
        category:        c.category    || "—",
        description:     c.description || "—",
        location:        c.location    || "—",
        photo_url:       c.photo       || "—",
        reported_by:     c.postedBy?.name  || "—",
        reporter_email:  c.postedBy?.email || "—",
        reporter_phone:  c.postedBy?.phone || "—",
        filed_on:        c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "—",
        assigned_to:     c.assignedTo?.name  || "—",
        vol_email:       c.assignedTo?.email || "—",
        vol_phone:       c.assignedTo?.phone || "—",
        status:          c.status || "—",
        resolved_on:     c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString("en-IN") : "—",
        days_to_resolve: daysToResolve,
      });
      styleDataRow(row, i);

      const statusCell = row.getCell("status");
      statusCell.fill = {
        type: "pattern", pattern: "solid",
        fgColor: { argb: statusArgb(c.status) },
      };
      statusCell.font = { bold: true, size: 10, name: "Arial" };
    });

    wsComp.autoFilter = { from: "A1", to: "P1" };
    wsComp.views = [{ state: "frozen", ySplit: 2 }];


    // ════════════════════════════════════════════════════════════════════════
    // SHEET 4 — BIDS / PAYMENTS
    // ════════════════════════════════════════════════════════════════════════
    const wsBids = wb.addWorksheet("Bids & Payments", {
      properties: { tabColor: { argb: "FFA78BFA" } },
    });

    setCols(wsBids, [
      { key: "bid_id",          header: "Bid ID",           width: 28 },
      { key: "complaint_id",    header: "Complaint ID",     width: 28 },
      { key: "complaint_title", header: "Complaint Title",  width: 30 },
      { key: "volunteer_id",    header: "Volunteer ID",     width: 28 },
      { key: "volunteer_name",  header: "Volunteer Name",   width: 22 },
      { key: "volunteer_email", header: "Volunteer Email",  width: 28 },
      { key: "volunteer_phone", header: "Volunteer Phone",  width: 16 },
      { key: "bid_amount",      header: "Bid Amount (₹)",   width: 16 },
      { key: "est_days",        header: "Est. Days",        width: 12 },
      { key: "score",           header: "Score (/100)",     width: 14 },
      { key: "bank_name",       header: "Bank Name",        width: 18 },
      { key: "account_last4",   header: "Account (last 4)", width: 16 },
      { key: "ifsc",            header: "IFSC Code",        width: 16 },
      { key: "account_holder",  header: "Account Holder",   width: 22 },
      { key: "selfie_url",      header: "Selfie URL",       width: 30 },
      { key: "bid_status",      header: "Bid Status",       width: 14 },
    ]);

    styleHeader(wsBids.getRow(1));
    styleSourceRow(
      wsBids.addRow([
        "bid._id", "complaint._id", "complaint.title",
        "volunteer._id", "volunteer.name", "volunteer.email", "volunteer.phone",
        "estimatedAmount", "estimatedDays", "scoreApplicant()",
        "bankDetails.bankName", "accountNumber.slice(-4)", "bankDetails.ifsc",
        "bankDetails.accountHolder", "bid.selfie", "accepted/pending/rejected",
      ])
    );

    const scoreApplicant = (b) => {
      const maxAmount = 10000, maxDays = 30;
      return Math.round(
        ((1 - b.estimatedAmount / maxAmount) * 0.5 +
         (1 - b.estimatedDays   / maxDays)   * 0.5) * 100
      );
    };

    bids.forEach((b, i) => {
      const bank  = b.bankDetails || {};
      const vol   = b.volunteer   || {};
      const score = scoreApplicant(b);

      const row = wsBids.addRow({
        bid_id:          b._id.toString(),
        complaint_id:    b.complaint?._id?.toString() || "—",
        complaint_title: b.complaint?.title || "—",
        volunteer_id:    vol._id?.toString() || "—",
        volunteer_name:  vol.name  || "—",
        volunteer_email: vol.email || "—",
        volunteer_phone: vol.phone || "—",
        bid_amount:      b.estimatedAmount || 0,
        est_days:        b.estimatedDays   || 0,
        score,
        bank_name:       bank.bankName || "—",
        account_last4:   bank.accountNumber ? `••••${bank.accountNumber.slice(-4)}` : "—",
        ifsc:            bank.ifsc    || "—",
        account_holder:  bank.accountHolder || "—",
        selfie_url:      b.selfie || "—",
        bid_status:      b.status || "pending",
      });
      styleDataRow(row, i);

      row.getCell("bid_amount").numFmt = '₹#,##0';

      // ✅ fixed: was "approved", now "accepted"
      if (b.status === "accepted") {
        row.getCell("bid_status").fill = {
          type: "pattern", pattern: "solid",
          fgColor: { argb: C.green_light },
        };
        row.getCell("bid_status").font = {
          bold: true, color: { argb: "FF15803D" }, size: 10, name: "Arial",
        };
      }

      if (b.status === "rejected") {
        row.getCell("bid_status").fill = {
          type: "pattern", pattern: "solid",
          fgColor: { argb: C.red_light },
        };
        row.getCell("bid_status").font = {
          bold: true, color: { argb: "FFB91C1C" }, size: 10, name: "Arial",
        };
      }
    });

    wsBids.autoFilter = { from: "A1", to: "P1" };
    wsBids.views = [{ state: "frozen", ySplit: 2 }];


    // ════════════════════════════════════════════════════════════════════════
    // SHEET 5 — SUMMARY
    // ════════════════════════════════════════════════════════════════════════
    const wsSummary = wb.addWorksheet("Summary", {
      properties: { tabColor: { argb: C.amber } },
    });

    wsSummary.columns = [
      { key: "metric", header: "Metric",         width: 32 },
      { key: "value",  header: "Value",          width: 20 },
      { key: "notes",  header: "Notes / Source", width: 40 },
    ];

    styleHeader(wsSummary.getRow(1));

    const resolved   = complaints.filter(c => c.status === "resolved");
    const pending    = complaints.filter(c => c.status === "pending");
    const assigned   = complaints.filter(c => c.status === "assigned");
    const activeVols = volunteers.filter(v => !v.volunteerDetails?.isAvailable);

    const resolvedWithTime = resolved.filter(c => c.resolvedAt && c.createdAt);
    const avgDays = resolvedWithTime.length
      ? (resolvedWithTime.reduce((sum, c) =>
          sum + (new Date(c.resolvedAt) - new Date(c.createdAt)) / 86400000, 0
        ) / resolvedWithTime.length).toFixed(1)
      : "N/A";

    // ✅ fixed: was "approved", now "accepted"
    const totalPayout = bids
      .filter(b => b.status === "accepted")
      .reduce((sum, b) => sum + (b.estimatedAmount || 0), 0);

    const catCount = {};
    complaints.forEach(c => {
      if (c.category) catCount[c.category] = (catCount[c.category] || 0) + 1;
    });
    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const summaryRows = [
      ["Export Generated On",       new Date().toLocaleString("en-IN"),     "Timestamp of this download"],
      ["Total Citizens Registered", users.length,                            "Sheet 1 row count"],
      ["Email Verified Citizens",   users.filter(u => u.isVerified).length,  "isVerified = true"],
      ["Total Volunteers",          volunteers.length,                       "Sheet 2 row count"],
      ["Available Volunteers",      volunteers.length - activeVols.length,   "isAvailable = true"],
      ["Busy Volunteers",           activeVols.length,                       "Currently on a task"],
      ["Total Complaints Filed",    complaints.length,                       "Sheet 3 row count"],
      ["Pending (unassigned)",      pending.length,                          "status = pending"],
      ["Assigned (in progress)",    assigned.length,                         "status = assigned"],
      ["Resolved",                  resolved.length,                         "status = resolved"],
      ["Resolution Rate",           complaints.length
                                      ? `${Math.round(resolved.length / complaints.length * 100)}%`
                                      : "0%",                                "resolved / total × 100"],
      ["Avg Days to Resolve",       avgDays === "N/A" ? "N/A" : `${avgDays} days`, "Mean of resolved complaints"],
      ["Total Accepted Payout",     totalPayout,                             "Sum of accepted bid amounts"],
      ["Total Bids Submitted",      bids.length,                             "Sheet 4 row count"],
      ["Top Complaint Category",    topCat,                                  "Highest frequency category"],
    ];

    summaryRows.forEach(([metric, value, notes], i) => {
      const row = wsSummary.addRow({ metric, value, notes });
      styleDataRow(row, i);
      row.getCell("metric").font = { bold: true, size: 10, name: "Arial" };
      if (metric === "Total Accepted Payout") {
        row.getCell("value").numFmt = '₹#,##0';
      }
    });

    wsSummary.views = [{ state: "frozen", ySplit: 1 }];


    // ── 3. Stream workbook to response ───────────────────────────────────────
    const now      = new Date();
    const dateStr  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    const filename = `JanSahayak_Export_${dateStr}.xlsx`;

    res.setHeader("Content-Type",        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control",       "no-cache");

    await wb.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ success: false, message: "Export failed", error: err.message });
  }
});

module.exports = router;