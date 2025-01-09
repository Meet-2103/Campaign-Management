const express = require("express");
const multer = require("multer");
const pool = require("../models/db");
const authenticateToken = require("../middleware/authMiddleware");
const PDFDocument = require("pdfkit");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Upload Invoices via CSV
router.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
  const fs = require("fs");
  const csv = require("csv-parser");
  const userId = req.user.id;

  try {
    const filePath = req.file.path;
    const invoices = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        invoices.push({
          user_id: row.user_id || userId,
          invoice_date: row.invoice_date,
          amount: parseFloat(row.amount),
          status: row.status,
        });
      })
      .on("end", async () => {
        for (const invoice of invoices) {
          await pool.query(
            "INSERT INTO invoices (user_id, invoice_date, amount, status) VALUES ($1, $2, $3, $4)",
            [invoice.user_id, invoice.invoice_date, invoice.amount, invoice.status]
          );
        }
        fs.unlinkSync(filePath);
        res.json({ message: "Invoices uploaded successfully!" });
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// List Invoices
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const result = await pool.query("SELECT * FROM invoices WHERE user_id = $1", [user_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Generate PDF Invoice
router.get("/pdf/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM invoices WHERE id = $1", [id]);
    const invoice = result.rows[0];

    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${id}.pdf`);

    doc.fontSize(18).text("Invoice", { underline: true, align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${invoice.id}`);
    doc.text(`User ID: ${invoice.user_id}`);
    doc.text(`Date: ${invoice.invoice_date}`);
    doc.text(`Amount: $${invoice.amount.toFixed(2)}`);
    doc.text(`Status: ${invoice.status}`);
    doc.end();

    doc.pipe(res);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
