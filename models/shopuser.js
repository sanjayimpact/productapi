import mongoose from "mongoose";

const shopuserSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'admin'
    },
    shop_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Shop'
    },
    role:{
        type:String,
        enum:['Owner','Staff'],
        default:'Owner'
    }
},{timestamps:true});
export const Shopuser = mongoose.models.Shopuser || mongoose.model('Shopuser', shopuserSchema);