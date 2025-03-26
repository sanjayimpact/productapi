import express from 'express';
import { allproducts } from '../controllers/products.js';


export const productRouter = express.Router();
productRouter.get('/',allproducts);