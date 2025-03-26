import mongoose from "mongoose";
const productTypeSchema = new mongoose.Schema({
    product_type_name:{
        type:String,
        required:true,
        trim:true
    },
    shop_id:{
      type:mongoose.Schema.Types.ObjectId,
              ref:'Shop'
    },
    product_type_status:{
        type:String,
        enum:["Active","Draft"],
        default:"Draft"
    }
},{timestamps:true});
export const ProductType = mongoose.models.ProductType || mongoose.model("ProductType",productTypeSchema);

//handleproductype selectedProducttype allProductType setProductType producttype Addnewpt