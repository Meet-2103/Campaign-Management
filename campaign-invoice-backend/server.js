const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const campaignRoutes = require("./routes/campaign");
const invoiceRoutes = require("./routes/invoices");


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/invoices", invoiceRoutes);

// Routes
app.use("/auth", authRoutes);
app.use("/campaigns", campaignRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
