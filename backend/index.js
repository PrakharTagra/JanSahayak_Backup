const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const database = require("./config/database");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// database connect
database.connect();

// middlewares
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));

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
app.listen(PORT, () => {
    console.log(`Your server is up and running on PORT NUMBER ${PORT}`);
});