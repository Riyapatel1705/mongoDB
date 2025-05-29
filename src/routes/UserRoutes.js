import express from 'express';
import { deleteUser, update } from '../controllers/UserController.js';
import { Authorization } from '../middleware/Auth.js';
const UserRouter=express.Router();

//user update Route
UserRouter.put('/api/update/:id',Authorization,update);

//delete user Route
UserRouter.delete('/api/delete/:id',Authorization,deleteUser);


export { UserRouter };