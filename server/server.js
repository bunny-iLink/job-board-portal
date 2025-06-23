import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connect } from "./database/connection.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import router from "./router/router.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors());
app.use(morgan("dev"));
app.disable("x-powered-by");

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).json("Welcome to the Job Portal API");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);

connect()
  .then(() => {
    try {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    } catch (error) {
      console.error("Cannot connect to the server:", error);
    }
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
