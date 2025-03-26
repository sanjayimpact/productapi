import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true
    },
    address:{
        type:String,
        trim:true
    },
    shop_id:{
      type:mongoose.Schema.Types.ObjectId,
              ref:'Shop'
    },
    isdefault:{
        type:Boolean,
        default:false
    }


},{timestamps:true})
export const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);