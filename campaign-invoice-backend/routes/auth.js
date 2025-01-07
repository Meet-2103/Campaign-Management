const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../models/db");

const authenticateToken = require("../middlewares/authMiddleware");
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
    console.log("step 1 pass");
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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email, first_name: user.rows[0].first_name } });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await pool.query("SELECT id, first_name, email FROM users WHERE id = $1", [req.user.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
