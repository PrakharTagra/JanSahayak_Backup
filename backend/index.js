const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const database = require("./config/database");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// database connect
database.connect();

// CORS
app.use(cors({
  origin: "https://jansahayak-rho.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// app.options("/.*/", cors({
//   origin: "https://jansahayak-rho.vercel.app",
//   credentials: true
// }));
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors({
      origin: "https://jansahayak-rho.vercel.app",
      credentials: true
    })(req, res, next);
  }
  next();
});

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/complaint", require("./routes/complaint"));
app.use("/api/v1/volunteer", require("./routes/volunteer"));
app.use("/api/v1/government", require("./routes/government"));
app.use("/api/v1/classify", require("./routes/classify"));

// default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your app is running successfully",
  });
});

// start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on PORT ${PORT}`);
});