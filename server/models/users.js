import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  preferredDomain: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  address: { type: String, default: null },
  phone: { type: String, default: null },
  profilePicture: {
    data: String, // base64 string
    contentType: String,
  },
  experience: { type: Number, default: null },
  resume: {
    data: String, // base64 PDF
    contentType: String,
  },
});

export const User = mongoose.model("User", userSchema);
