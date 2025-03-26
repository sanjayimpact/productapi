import express from 'express';
import allCategory from '../controllers/category.js';


export const userRouter = express.Router();
userRouter.get('/catpro/:handle',allCategory)