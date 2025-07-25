import jwt from "jsonwebtoken";
import Database from "../config/database.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists in database
    const userResult = await Database.query(
      "SELECT id, email, username FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        success: false,
        error: "Invalid token",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        error: "Token expired",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication error",
    });
  }
};

export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "7d" } // Token expires in 7 days
  );
};
