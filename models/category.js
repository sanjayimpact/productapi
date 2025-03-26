import mongoose from 'mongoose'
const categorySchema = new mongoose.Schema({
    collection_id:{
        type:Number
    },
    title:{
        type:String
    },
    handle:{
        type:String
    },
    cat_image:{
        type:String
    },
    meta_title:{
        type:String
    },
    meta_desc:{
        type:String
    },
    body_html:{
        type:String
    },
    rules:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'RuleCondition'
    }
},{timestamps:true})
export const Category = mongoose.models.Category || mongoose.model("Category",categorySchema);