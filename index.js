import express from 'express';
import cors from 'cors'
import connectDb from './db.js';
import { userRouter } from './routes/catpro.js';
import { productRouter } from './routes/allproduct.js';

const app = express();
const port = 4000;

app.use(cors());



app.get('/',(req,res)=>{
    res.send('Hello World')
})
app.use('/api',userRouter)
app.use('/api/product',productRouter)
app.listen(port,()=>{
    connectDb();
    console.log(`server is running on port ${port}`)
})