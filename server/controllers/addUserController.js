import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { userSchema } from "../models/users.js";
import { employerSchema } from "../models/employer.js";

const User = mongoose.model("User", userSchema);
const Employer = mongoose.model("Employer", employerSchema);

const SALT_ROUNDS = 10;

export async function addUser(req, res) {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create and save the new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        console.log("User added successfully:", savedUser);
        return res.status(201).json({
            message: "User added successfully",
            user: savedUser
        });

    } catch (err) {
        console.error("Error adding user:", err);
        return res.status(500).json({
            message: "Error adding user",
            error: err.message || err
        });
    }
}

export async function addEmployer(req, res) {
    try {
        const { name, email, password, companyName } = req.body;

        // Check for existing employer with same email or company name
        const existingEmployer = await Employer.findOne({
            $or: [{ email }, { companyName }]
        });

        if (existingEmployer) {
            let conflictField = existingEmployer.email === email ? "email" : "company name";
            return res.status(400).json({
                message: `Employer already exists with this ${conflictField}`
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create and save the new employer
        const newEmployer = new Employer({
            name,
            email,
            password: hashedPassword,
            companyName
        });

        const savedEmployer = await newEmployer.save();

        console.log("Employer added successfully:", savedEmployer);
        return res.status(201).json({
            message: "Employer added successfully",
            employer: savedEmployer
        });

    } catch (err) {
        console.error("Error adding employer:", err);
        return res.status(500).json({
            message: "Error adding employer",
            error: err.message || err
        });
    }
}
