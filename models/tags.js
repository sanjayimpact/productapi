import mongoose from "mongoose";
const tagSchema = new mongoose.Schema({

    tag_name:{
        type:String,
        trim:true,
        required:true
        

    },
    shop_id:{
        type:mongoose.Schema.Types.ObjectId,
                ref:'Shop'
    },
    tag_status:{
        type:String,
        enum:['Active','Draft'],
        default:'Draft'
    }
},{timestamps:true})
export const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);