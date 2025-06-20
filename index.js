import express from 'express';
import cors from 'cors'
import connectDb from './db.js';
import compression from "compression";
import { userRouter } from './routes/catpro.js';
import { myrouter } from './routes/myroute.js';
import { productRouter } from './routes/allproduct.js';
import { categoryRouter } from './routes/categories.js';
import { menuRouter } from './routes/menus.js';

const app = express();
const port = 3000;
app.use(compression());

app.use(cors());
app.use('/api',userRouter)
app.use('/api/product',productRouter)
app.use('/api/category',categoryRouter)
app.use('/api/menu',menuRouter)


// app.use('/api',userRouter)


app.listen(port,()=>{
    connectDb();
    console.log(`server is running on port ${port}`)
})