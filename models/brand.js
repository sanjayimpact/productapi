import mongoose from 'mongoose';
const brandschema = new mongoose.Schema({
    brand_name:{
        type:String,
        trim:true,
        
    },
    shop_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Shop'

    },
    brand_status:{
        type:String,
        enum:['Active','Draft'],
        default:'Draft'
    }
},{timestamps:true})
export const Brand = mongoose.models.Brand || mongoose.model('Brand',brandschema);
