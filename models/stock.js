import mongoose from "mongoose";
const stockSchema = new mongoose.Schema({
    location_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Location"
    },
    quantity:{
        type:Number,
        default:0
    },
    variant_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Variant"
    },
    shop_id:{
       type:mongoose.Schema.Types.ObjectId,
               ref:'Shop'
    },
    isdefault:{
        type:Boolean,
        enum:[true,false],
        default:false
    }

},{timestamps:true})
export const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);