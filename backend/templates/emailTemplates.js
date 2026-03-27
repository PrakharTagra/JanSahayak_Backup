// ─────────────────────────────────────────────────────────────
// Sent immediately after signup — contains the verify link
// ─────────────────────────────────────────────────────────────
const verificationTemplate = (name, verifyUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#060e1f; font-family:'Segoe UI',sans-serif; color:#e2e8f0; }
    .wrap { max-width:520px; margin:40px auto; background:#0a1628; border:1px solid rgba(180,120,0,0.3); }
    .bar  { height:4px; background:linear-gradient(to right,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%); }
    .head { padding:28px 32px 20px; border-bottom:1px solid rgba(180,120,0,0.2); }
    .head h1 { margin:0; font-size:20px; font-weight:700; color:#fff; }
    .head p  { margin:4px 0 0; font-size:11px; color:#7c8ba0; font-family:monospace; }
    .body { padding:28px 32px; }
    .body p  { font-size:13px; line-height:1.7; color:#94a3b8; margin:0 0 16px; }
    .btn  { display:inline-block; margin:8px 0 20px; padding:13px 28px;
            background:#d97706; color:#fff; text-decoration:none;
            font-size:13px; font-weight:700; font-family:monospace;
            letter-spacing:0.08em; text-transform:uppercase; }
    .note { font-size:11px; color:#475569; font-family:monospace; }
    .foot { padding:16px 32px; border-top:1px solid rgba(180,120,0,0.15);
            font-size:10px; color:#334155; font-family:monospace; text-align:center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="bar"></div>
    <div class="head">
      <h1>JanSahayak</h1>
      <p>जन सहायक — नागरिक शिकायत निवारण पोर्टल</p>
    </div>
    <div class="body">
      <p>Dear <strong style="color:#fff">${name}</strong>,</p>
      <p>
        Thank you for registering on the JanSahayak portal. To activate your account
        and start filing grievances, please verify your email address by clicking the
        button below.
      </p>
      <a href="${verifyUrl}" class="btn">✔ Verify My Email</a>
      <p>
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <span style="color:#f59e0b;word-break:break-all;">${verifyUrl}</span>
      </p>
      <p class="note">⏱ This link will expire in <strong>24 hours</strong>.</p>
      <p class="note">
        If you did not create an account on JanSahayak, you can safely ignore this email.
      </p>
    </div>
    <div class="foot">
      © 2026 JanSahayak — Government of India | Ministry of Housing & Urban Affairs
    </div>
    <div class="bar"></div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────
// Sent after the user successfully clicks the verify link
// ─────────────────────────────────────────────────────────────
const welcomeTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#060e1f; font-family:'Segoe UI',sans-serif; color:#e2e8f0; }
    .wrap { max-width:520px; margin:40px auto; background:#0a1628; border:1px solid rgba(180,120,0,0.3); }
    .bar  { height:4px; background:linear-gradient(to right,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%); }
    .head { padding:28px 32px 20px; border-bottom:1px solid rgba(180,120,0,0.2); }
    .head h1 { margin:0; font-size:20px; font-weight:700; color:#fff; }
    .head p  { margin:4px 0 0; font-size:11px; color:#7c8ba0; font-family:monospace; }
    .body { padding:28px 32px; }
    .body p  { font-size:13px; line-height:1.7; color:#94a3b8; margin:0 0 16px; }
    .badge { display:inline-block; padding:6px 16px; background:rgba(34,197,94,0.1);
             border:1px solid rgba(34,197,94,0.3); color:#4ade80;
             font-size:11px; font-family:monospace; margin-bottom:20px; }
    .foot { padding:16px 32px; border-top:1px solid rgba(180,120,0,0.15);
            font-size:10px; color:#334155; font-family:monospace; text-align:center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="bar"></div>
    <div class="head">
      <h1>JanSahayak</h1>
      <p>जन सहायक — नागरिक शिकायत निवारण पोर्टल</p>
    </div>
    <div class="body">
      <div class="badge">✅ Email Verified Successfully</div>
      <p>Dear <strong style="color:#fff">${name}</strong>,</p>
      <p>
        Welcome to JanSahayak! Your account has been verified and is now active.
        You can log in and start reporting civic issues in your area.
      </p>
      <p>
        Our platform connects citizens directly with municipal authorities to ensure
        faster resolution of public grievances.
      </p>
      <p style="color:#64748b;font-size:11px;font-family:monospace;">
        Helpline: 1800-XXX-XXXX | Mon–Sat · 9AM–6PM
      </p>
    </div>
    <div class="foot">
      © 2026 JanSahayak — Government of India | Ministry of Housing & Urban Affairs
    </div>
    <div class="bar"></div>
  </div>
</body>
</html>
`;

module.exports = { verificationTemplate, welcomeTemplate };