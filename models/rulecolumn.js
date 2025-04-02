import mongoose from "mongoose";

const ruleColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true  
  }
}, { timestamps: true });




export const RuleColumn = mongoose.models.RuleColumn || mongoose.model("RuleColumn", ruleColumnSchema);
