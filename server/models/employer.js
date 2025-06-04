import mongoose from 'mongoose';

export const employerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'employer' },
    organization: { type: String, required: true, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    company: { type: String, required: true, default: null },
    experience: { type: Number, default: null },
    designation: { type: String, required: true, default: null },
    domain: { type: String, required: true, default: null },
})