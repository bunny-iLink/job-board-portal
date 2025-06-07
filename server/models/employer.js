import mongoose from 'mongoose';

export const employerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: { type: String, default: 'employer' },
    company: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    company: { type: String, default: null },
    experience: { type: Number, default: null },
    designation: { type: String, default: null },
    domain: { type: String, default: null },
})