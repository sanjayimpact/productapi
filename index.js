import express from 'express';
import cors from 'cors'
import connectDb from './db.js';

import { userRouter } from './routes/catpro.js';

const app = express();
const port = 4000;

app.use(cors());




app.use('/',(req,res)=>{
    res.send("hello world")
})
app.use('/api',userRouter)
app.listen(port,()=>{
    connectDb();
    console.log(`server is running on port ${port}`)
})