import mongoose from "mongoose";

const optionnameSchema = new mongoose.Schema({
    optionName:{
        type:String
        
    },
    shopId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Shop"
    }
},{timestamps:true})
export const Option = mongoose.models.Option || mongoose.model("Option",optionnameSchema);