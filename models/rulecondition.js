import mongoose from "mongoose";

const ruleConditionSchema = new mongoose.Schema({
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RuleColumn",
    index: true  // ✅ For filtering conditions by column
  },
  relation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RuleRelation",
    index: true  // ✅ For filtering by relation type
  },
  value: {
    type: String,
    index: true  // ✅ Enables searches for specific values
  },
  logicalOperator: {
    type: String, 
    enum: ["AND", "OR"],
    index: true  // ✅ For condition grouping logic
  }
}, { timestamps: true });

// Optional compound index (for advanced filters)
ruleConditionSchema.index({ column: 1, relation: 1, logicalOperator: 1 });

export const RuleCondition = mongoose.models.RuleCondition || mongoose.model("RuleCondition", ruleConditionSchema);
