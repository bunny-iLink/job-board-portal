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

export async function getUserData(req, res) { 
    try {
        const userId = req.params.userId;

        // Validate userId
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the user data
        return res.status(200).json({
            message: "User data retrieved successfully",
            user
        });
    } catch (err) {
        console.error("Error retrieving user data:", err);
        return res.status(500).json({
            message: "Error retrieving user data",
            error: err.message || err
        });
    }
}

export async function getEmployerData(req, res) {
    try {
        const employerId = req.params.employerId;

        // Validate employerId
        if (!employerId) {
            return res.status(400).json({ message: "Employer ID is required" });
        }

        // Find the employer by ID
        const employer = await Employer.findById(employerId);
        if (!employer) {
            return res.status(404).json({ message: "Employer not found" });
        }

        // Return the employer data
        return res.status(200).json({
            message: "Employer data retrieved successfully",
            employer
        });

    } catch (err) {
        console.error("Error retrieving employer data:", err);
        return res.status(500).json({
            message: "Error retrieving employer data",
            error: err.message || err
        });
    }
}