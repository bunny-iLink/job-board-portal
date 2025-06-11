import { User } from "../models/users.js";
import { Employer } from "../models/employer.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config.js";

export async function loginUser(req, res) {
    try {
        console.log("Login attempt received");

        const { email, password } = req.body;

        if (!email || !password) {
            console.warn("Login failed: Missing email or password");
            return res.status(400).json({ message: "Email and password are required" });
        }

        console.log(`Searching for account with email: ${email}`);

        const user = await User.findOne({ email });
        const employer = !user ? await Employer.findOne({ email }) : null;

        const account = user || employer;
        const accountType = user ? "user" : employer ? "employer" : null;

        if (!account) {
            console.warn(`Login failed: No account found for email ${email}`);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log(`Account found. Type: ${accountType}, ID: ${account._id}`);

        const isPasswordValid = await bcrypt.compare(password, account.password);

        if (!isPasswordValid) {
            console.warn(`Login failed: Incorrect password for email ${email}`);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("Password validated. Creating JWT...");

        const token = jwt.sign(
            {
                id: account._id,
                email: account.email,
                role: accountType
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log(`JWT created for ${accountType} (${account.email})`);

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
