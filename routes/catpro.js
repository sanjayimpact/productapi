import express from 'express';
import{ allCategory, productcount} from '../controllers/categoryproduct.js';


export const userRouter = express.Router();
userRouter.get('/catpro/:handle',allCategory)
userRouter.get('/countpro/:handle',productcount)