import express from "express";
import bcrypt from "bcryptjs";
import { authenticateToken, generateToken } from "../middleware/auth.js";
import Database from "../config/database.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Input validation
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "Email, username, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await Database.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email.toLowerCase(), username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "User with this email or username already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await Database.query(
      `INSERT INTO users (email, username, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, username, created_at`,
      [email.toLowerCase(), username, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register user",
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user
    const result = await Database.query(
      "SELECT id, email, username, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to login",
    });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = req.user; // Set by authenticateToken middleware

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user profile",
    });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Username is required",
      });
    }

    // Check if username is already taken by another user
    const existingUser = await Database.query(
      "SELECT id FROM users WHERE username = $1 AND id != $2",
      [username, userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Username already taken",
      });
    }

    // Update user
    const result = await Database.query(
      "UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, username",
      [username, userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
});

// Change password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters long",
      });
    }

    // Get current password hash
    const userResult = await Database.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      userResult.rows[0].password_hash
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await Database.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to change password",
    });
  }
});

export default router;
