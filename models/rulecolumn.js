import mongoose from "mongoose";

const ruleColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true  // ✅ Enables fast lookup when building filters from rules
  }
}, { timestamps: true });

// Optional: enforce unique column names if needed
ruleColumnSchema.index({ name: 1 }, { unique: true });

export const RuleColumn = mongoose.models.RuleColumn || mongoose.model("RuleColumn", ruleColumnSchema);
