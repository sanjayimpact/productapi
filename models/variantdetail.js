import mongoose from "mongoose";
const variantdetailSchema = new mongoose.Schema({
    variant_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"variant"
    },
    Options:{
        type:[String]
    },
    option_values: {
        type: Map,
        of: String, // All values will be strings
  
    }, isdefault:{
        type:Boolean,
        enum:[true,false],
        default:false
    }

})


  
export const Variantdetail = mongoose.models.Variantdetail || mongoose.model('Variantdetail',variantdetailSchema);