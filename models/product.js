import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true

    },
    handle:{
        type:String,
        trim:true,
     
    },
    publish_status:{
  type:String,
trim:true,
enum:['Online Store','Other'],

    },
    meta_title:
    {
        type:String,
        trim:true,
    },
    meta_description:{
        type:String,
    },



    body_html:{
        type:mongoose.Schema.Types.Mixed,
        trim:true
    },
    featured_image:{
        type:String,
      
    },
    shop_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Shop'

    },
    product_status:{
        type:String,
        enum:['Active','Draft'],
        default:'Draft'
    },
    brand_name:{
        type:mongoose.Schema.Types.ObjectId,

        ref:'Brand',
       

    },
    tags:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tag',
        default:[]
    }],
    product_type:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ProductType',
        
    },
    product_id:{
        type:Number
    }

},{timestamps:true})
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);