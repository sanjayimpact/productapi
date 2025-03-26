import mongoose from 'mongoose';

const varianSchema = new mongoose.Schema({
    price:{
        type: String,
  

    },
    compareprice:{
       type:String,
    },
    sku:{
        type:String,
 
        unique:true

    },
    costprice:{
        type:String,
    },
    barcode:{
      type:String,
      
    },
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },

    variant_image:{
        type:String,
        trim:true
    },
    shop_id:{
      type:mongoose.Schema.Types.ObjectId,
              ref:'Shop'
    },
    isVariandetails:{
        type:Number,
        default:0
    },
    istax:{
        type:Boolean,
        default:false
    },
    isdefault:{
        type:Boolean,
        enum:[true,false],
        default:false
    },
    weight:{
        type:String,
        trim:true,
    },
    p_id:{
        type:Number,
        default:0
    }
},{timestamps:true});
export const Variant = mongoose.models.Variant || mongoose.model('Variant', varianSchema);