import mongoose from "mongoose";

export const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model("Notification", notificationSchema);
