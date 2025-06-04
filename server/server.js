import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import pkg_connection from './database/connection.js'
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg_router from './router/router.js';
const { connect } = pkg_connection;
const { router } = pkg_router; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(express.urlencoded());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).json("Welcome to the Job Portal API");
});

app.use('/api', router);

connect().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Cannot connect to the server:", error);
    }
}).catch((error) => {
    console.error("Error connecting to the database:", error);
});