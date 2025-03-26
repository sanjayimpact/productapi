import mongoose from "mongoose";

const ruleConditionSchema = new mongoose.Schema({
    column: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RuleColumn",
      
    },
    relation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RuleRelation",
       
    },
    value: {
        type: String,
      
    },
    logicalOperator: {
        type: String, 
        enum: ["AND", "OR"],
    
    }
}, { timestamps: true });

export const RuleCondition = mongoose.models.RuleCondition || mongoose.model("RuleCondition", ruleConditionSchema);
