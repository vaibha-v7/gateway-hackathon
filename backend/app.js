require("dotenv").config();

const express = require("express");
const cors = require("cors");

const triageRoutes = require("./routes/triageRoutes");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "FRONTLINE backend is running"
    });
});

app.use("/api/triage", triageRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});