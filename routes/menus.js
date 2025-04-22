import express from 'express';
import { Allbrands, Alloption, AllproductType, Alltags } from '../controllers/menuControllers.js';

export const menuRouter = express.Router();

menuRouter.get("/alloptions",Alloption);
menuRouter.get("/alltags",Alltags);
menuRouter.get("/allproducttype",AllproductType);
menuRouter.get("/allbrands",Allbrands);