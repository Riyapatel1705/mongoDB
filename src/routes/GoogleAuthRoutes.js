import express from "express";
import { authenticateUser, authenticateCallback } from "../controllers/GoogleAuthController.js";

const GoogleAuthRouter = express.Router();

// Route to start Google authentication
GoogleAuthRouter.get("/api/auth/google", authenticateUser);

// Google OAuth callback route
GoogleAuthRouter.get("/auth/google/callback", authenticateCallback);

export { GoogleAuthRouter };