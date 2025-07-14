import { User } from "../models/users.js";
import { Employer } from "../models/employer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET_LOGIN, JWT_SECRET_REFRESH } from "../config.js";

export async function loginUser(req, res) {
  try {
    console.log("Login attempt received");

    const { email, password } = req.body;

    if (!email || !password) {
      console.warn("Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    console.log(`Looking up account for: ${email}`);

    // Try finding the account in both collections
    const [user, employer] = await Promise.all([
      User.findOne({ email }),
      Employer.findOne({ email }),
    ]);

    const account = user || employer;

    if (!account) {
      console.warn(`No account found for: ${email}`);
      return res.status(404).json({ message: "Invalid email or password" }); // unified error message
    }

    const accountType = user ? "user" : "employer";

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      console.warn(`Invalid password attempt for: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`Authenticated ${accountType} with ID: ${account._id}`);

    const accessToken = jwt.sign(
      {
        id: account._id,
        email: account.email,
        role: accountType,
      },
      JWT_SECRET_LOGIN,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      {
        id: account._id,
        email: account.email,
        role: accountType,
      },
      JWT_SECRET_REFRESH,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      refresh_token: refreshToken,
      user: {
        _id: account._id,
        email: account.email,
        role: accountType,
        name: account.name || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

export async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    console.warn("⚠️ No refresh token provided");
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    console.log("🔄 Verifying refresh token:", refreshToken);
    console.log("🔄 Attempting to verify refresh token...");
    const payload = jwt.verify(refreshToken, JWT_SECRET_REFRESH); // ✅ use correct secret
    const { id, email, role } = payload;

    console.log(`✅ Refresh token valid for user: ${email}, issuing new access token...`);

    const accessToken = jwt.sign({ id, email, role }, JWT_SECRET_LOGIN, {
      expiresIn: "1h",
    });

    console.log(`✅ New access token issued: ${accessToken}`);

    return res.status(200).json({
      accessToken,
      message: "Access token refreshed",
    });
  } catch (err) {
    console.error("❌ Invalid or expired refresh token:", err.message);
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
}
