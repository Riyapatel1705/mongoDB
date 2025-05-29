import express from 'express';
import { register,login } from '../controllers/AuthController.js';
const AuthRouter = express.Router()


// User Registration
AuthRouter.post('/api/register', register);
AuthRouter.post('/api/login',login)

export {AuthRouter};

