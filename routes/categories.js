
import express from 'express';
import { categorylist } from '../controllers/categories.js';
export const categoryRouter = express.Router();


categoryRouter.get('/',categorylist)