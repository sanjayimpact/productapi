import express from 'express'
import { getname } from '../controllers/getname.js';
export const myrouter = express.Router();
myrouter.get('/getname',getname)