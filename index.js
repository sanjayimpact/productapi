import express from 'express';
import cors from 'cors'
import connectDb from './db.js';

import { userRouter } from './routes/catpro.js';
import { myrouter } from './routes/myroute.js';

const app = express();
const port = 4000;

app.use(cors());

app.use('/api',userRouter)

// app.use('/api',userRouter)


app.listen(port,()=>{
    connectDb();
    console.log(`server is running on port ${port}`)
})