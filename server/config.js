import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env once, globally
dotenv.config({ path: path.join(__dirname, ".env") });

export const JWT_SECRET_LOGIN = process.env.JWT_SECRET_LOGIN;
export const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH;
export const DB_URL = process.env.ATLAS_URI;

