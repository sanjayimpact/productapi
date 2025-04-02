import mongoose from "mongoose";

const connectDb = async()=>{
    try{
         await mongoose.connect("mongodb+srv://admin:admin@cluster0.lcm6m.mongodb.net/Ecart")
         console.log("database successfully connected")
    }catch(err){}
}
connectDb();
export default connectDb;