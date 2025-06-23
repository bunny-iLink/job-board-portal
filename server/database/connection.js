import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { DB_URL } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

export async function connect() {
  const getUri = DB_URL;
  mongoose.set("strictQuery", true);
  const db = await mongoose.connect(getUri);
  console.log("DATABASE CONNECTED");
}
