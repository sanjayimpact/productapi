import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    shop_name:{
        type:String,
        trim:true
    },
    slug:{
       type:String,
       trim:true
    },
    shop_status:{
        type:String,
        trim:true,
        enum:['Active','Draft'],
        default:'Draft'
    }
   
},{timestamps:true})

export const Shop = mongoose.models.Shop || mongoose.model('Shop',shopSchema);