const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/authMiddleware");
const { Campaign, Invoice } = require("../models"); // Ensure you have Sequelize or equivalent models set up

// Route to fetch all campaigns
router.get("/campaigns", authenticateAdmin, async (req, res) => {
  try {
    const campaigns = await Campaign.findAll();
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).send("Error fetching campaigns.");
  }
});

// Approve or Reject a campaign
router.patch("/campaigns/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "approved" or "rejected"

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).send("Invalid status.");
  }

  try {
    const campaign = await Campaign.findByPk(id);
    if (!campaign) return res.status(404).send("Campaign not found.");

    campaign.status = status;
    await campaign.save();
    res.send(`Campaign ${id} ${status}.`);
  } catch (error) {
    console.error("Error updating campaign status:", error);
    res.status(500).send("Error updating campaign status.");
  }
});

// Route to upload invoices (CSV)
router.post("/upload-invoices", authenticateAdmin, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("No file uploaded.");
    }

    const file = req.files.file;
    const csvData = file.data.toString("utf-8");
    const rows = csvData.split("\n").slice(1); // Skip header row

    for (const row of rows) {
      const [user_id, invoice_date, amount, status] = row.split(",");

      if (!user_id || !invoice_date || !amount || !status) continue;

      await Invoice.create({
        user_id: user_id.trim(),
        invoice_date: new Date(invoice_date.trim()),
        amount: parseFloat(amount.trim()),
        status: status.trim(),
      });
    }

    res.send("Invoices uploaded successfully.");
  } catch (error) {
    console.error("Error uploading invoices:", error);
    res.status(500).send("Error uploading invoices.");
  }
});

module.exports = router;
