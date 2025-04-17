import mongoose from "mongoose";

const connectDb = async()=>{
    try{
         await mongoose.connect("mongodb://localhost:27017/vapetocart")
         console.log("database successfully connected")
    }catch(err){}
}
connectDb();
export default connectDb;