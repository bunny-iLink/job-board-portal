import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    address: { type: String, required: true, default: null },
    phone: { type: String, required: true, default: null },
    profilePicture: { type: String, default: null },
    experience: { type: number, default: null },
})