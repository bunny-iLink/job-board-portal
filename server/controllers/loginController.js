import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userSchema } from "../models/users.js";
import { employerSchema } from "../models/employer.js";

const User = mongoose.model("User", userSchema);
const Employer = mongoose.model("Employer", employerSchema);

// Replace with your actual secret (store this securely in env in real apps)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Search in both User and Employer collections
        const user = await User.findOne({ email });
        const employer = !user ? await Employer.findOne({ email }) : null;

        const account = user || employer;
        const accountType = user ? "user" : employer ? "employer" : null;

        if (!account) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Create a JWT token
        const token = jwt.sign(
            {
                id: account._id,
                email: account.email,
                role: accountType
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: account
        });

    } catch (err) {
        console.error("Error logging in:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message || err
        });
    }
}
