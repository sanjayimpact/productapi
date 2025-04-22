
import express from 'express';
import { categorylist, getCategoryById } from '../controllers/categories.js';
export const categoryRouter = express.Router();


categoryRouter.get('/',categorylist)
categoryRouter.get('/:id',getCategoryById)
