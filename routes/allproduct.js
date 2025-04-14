import express from 'express';
import { allproducts ,getproductbyid} from '../controllers/products.js';


export const productRouter = express.Router();
productRouter.get('/',allproducts);
productRouter.get('/:id',getproductbyid);