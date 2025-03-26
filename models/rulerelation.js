import mongoose from "mongoose";

const ruleRelationSchema = new mongoose.Schema({
    column_id:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'RuleColumn'
    },
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const RuleRelation = mongoose.models.RuleRelation || mongoose.model("RuleRelation", ruleRelationSchema);
