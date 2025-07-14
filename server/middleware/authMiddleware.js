import jwt from "jsonwebtoken";
import { JWT_SECRET_LOGIN } from "../config.js"; // 👈 Correct secret used for access tokens

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "Token missing" });

  const token = authHeader.split(" ")[1]; // Get token from "Bearer <token>"
  if (!token) return res.status(403).json({ message: "Malformed token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET_LOGIN); // 👈 Correct secret
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      console.log(req.user);
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
