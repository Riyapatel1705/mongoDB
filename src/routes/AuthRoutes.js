import express from 'express';
import { register } from '../controllers/AuthController.js';
export const AuthRouter = express.Router()


// User Registration
AuthRouter.post('/api/register', register);

