import mongoose from "mongoose";

const optionnameSchema = new mongoose.Schema({
    optionName:{
        type:String,
        index:true
        
    },
    shopId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Shop",
        index:true
    }
},{timestamps:true})
export const Option = mongoose.models.Option || mongoose.model("Option",optionnameSchema);