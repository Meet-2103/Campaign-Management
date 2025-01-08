const express = require("express");
const multer = require("multer");
const pool = require("../models/db");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Upload Campaigns via CSV
router.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
  const fs = require("fs");
  const csv = require("csv-parser");
  const userId = req.user.id;

  try {
    const filePath = req.file.path;
    const campaigns = [];

    // Parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        campaigns.push({
          campaign_name: row.campaign_name,
          pan_card_number: row.pan_card_number,
          budget: parseFloat(row.budget),
          start_date: row.start_date,
          end_date: row.end_date,
        });
      })
      .on("end", async () => {
        // Insert campaigns into the database
        for (const campaign of campaigns) {
          await pool.query(
            "INSERT INTO campaigns (user_id, campaign_name, pan_card_number, budget, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [userId, campaign.campaign_name, campaign.pan_card_number, campaign.budget, campaign.start_date, campaign.end_date]
          );
        }
      
        fs.unlinkSync(filePath); // Remove the uploaded file
        res.json({ message: "Campaigns uploaded successfully!" });
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Edit a Campaign
router.patch("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { campaign_name, pan_card_number, budget, start_date, end_date } = req.body;

  try {
    await pool.query(
      "UPDATE campaigns SET campaign_name = $1, pan_card_number = $2, budget = $3, start_date = $4, end_date = $5 WHERE id = $6 AND user_id = $7",
      [campaign_name, pan_card_number, budget, start_date, end_date, id, req.user.id]
    );
    res.json({ message: "Campaign updated successfully!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Delete a Campaign
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM campaigns WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    res.json({ message: "Campaign deleted successfully!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
