import express from 'express';
import { Alloption, Alltags } from '../controllers/menuControllers.js';

export const menuRouter = express.Router();

menuRouter.get("/alloptions",Alloption);
menuRouter.get("/alltags",Alltags);