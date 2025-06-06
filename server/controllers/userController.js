import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { userSchema } from "../models/users.js";
import { employerSchema } from "../models/employer.js";

const User = mongoose.model("User", userSchema);
const Employer = mongoose.model("Employer", employerSchema);

const SALT_ROUNDS = 10;

// User Section

// Add a new user

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

// Get user data by ID

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

// Update user data by ID

export async function updateUserData(req, res) {
    try {
        const userId = req.params.userId;

        const updatedData = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Find the user by ID and update
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updatedData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User updated successfully:", updatedUser);
        return res.status(200).json({
            message: "User updated successfully",
        })
    } catch (err) {
        console.error("Error updating user data:", err);
        return res.status(500).json({
            message: "Error updating user data",
            error: err.message || err
        });
    }
}

// Delete user by ID

export async function deleteUserData(req, res) {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(404).json({ message: "User ID is required" });
        }

        const result = await User.deleteOne({ _id: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Failed to delete user" });
        }

        return res.status(200).json({ message: "User deleted successfully" });

    } catch (err) {
        console.log("Error occured: ", err);
        return res.status(500).json({
            message: "Some error occured",
            error: err.message || err
        });
    }
}

// Employer Section

// Add a new employer

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

// Get employer data by ID

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

// Update employer data by ID

export async function updateEmployerData(req, res) {
    try {
        const employerId = req.params.employerId;

        const updatedData = req.body;

        if (!employerId) {
            return res.status(400).json({ message: "Employer ID is required" });
        }

        const result = await Employer.findByIdAndUpdate(
            employerId,
            updatedData,
            { new: true, runValidators: true }
        )

        if (!result) {
            return res.status(404).json({ message: "Employer not found" });
        }
        console.log("Employer updated successfully:", result);
        return res.status(200).json({
            message: "Employer updated successfully"
        });
    } catch (err) {
        console.error("Error updating employer data:", err);
        return res.status(500).json({
            message: "Error updating employer data",
            error: err.message || err
        });
    }
}

// Delete Employer by ID

export async function deleteEmployerData(req, res) {
    try {
        const employerId = req.params.employerId;

        if (!employerId) {
            return res.status(404).json({ message: "Employer not found" });
        }

        const result = await Employer.deleteOne({ _id: employerId });

        if (result.deletedCount === 0) {
            res.status(404).json({ message: "Failed to delete employer" });
        }

        return res.status(200).json({ message: "Employer deleted successfully" });

    } catch (err) {
        console.log("Error occured: ", err);
        return res.status(500).json({
            message: "Some error occured",
            error: err
        })
    }
} 