import env from 'dotenv';
import express from 'express';
import path from 'path';
import { AuthRouter } from './src/routes/AuthRoutes.js';
import { UserRouter } from './src/routes/UserRoutes.js';
import {connectDB} from './src/db/index.js';
import { EventRouter } from './src/routes/EventRoutes.js';
import { OrganizationRouter } from './src/routes/OrganizationRoutes.js';
import { Feedback } from './src/db/models/Feedback.js';
import { GoogleAuthRouter } from './src/routes/GoogleAuthRoutes.js';
import { fileURLToPath } from 'url';

const app = express();
env.config();
const PORT = 7000;

app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/public", express.static(path.join(__dirname, "public")));



// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
connectDB();


app.use('/',AuthRouter);
app.use('/',UserRouter);
app.use('/',GoogleAuthRouter);
app.use(EventRouter);
app.use(OrganizationRouter);


console.log("Server file loaded");
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});