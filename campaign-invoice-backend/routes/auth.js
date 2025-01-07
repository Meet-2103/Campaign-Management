const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../models/db");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, phone_number, pan_card_number, password } = req.body;

  try {
    // Check for duplicate email or PAN Card
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR pan_card_number = $2",
      [email, pan_card_number]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email or PAN Card already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into the database
    await pool.query(
      "INSERT INTO users (first_name, last_name, email, phone_number, pan_card_number, password) VALUES ($1, $2, $3, $4, $5, $6)",
      [first_name, last_name, email, phone_number, pan_card_number, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
