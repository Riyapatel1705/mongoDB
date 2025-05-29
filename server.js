import env from 'dotenv';
import express from 'express';
import path from 'path';
import { AuthRouter } from './src/routes/AuthRoutes.js';
import { UserRouter } from './src/routes/UserRoutes.js';
import {connectDB} from './src/db/index.js';
const app = express();
env.config();
const PORT = 3000;

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
connectDB();


app.use('/',AuthRouter);
app.use('/',UserRouter);

console.log("Server file loaded");
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});