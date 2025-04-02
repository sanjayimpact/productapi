import mongoose from "mongoose";

const ruleRelationSchema = new mongoose.Schema({
  column_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RuleColumn',
    index: true  // ✅ Speeds up joins/filters on related columns
  },
  name: {
    type: String,
    required: true,
    index: true  // ✅ Fast lookup or filtering by relation name
  }
}, { timestamps: true });

// Optional: Unique relation name per column (to avoid duplicates)
ruleRelationSchema.index({ column_id: 1, name: 1 }, { unique: true });

export const RuleRelation = mongoose.models.RuleRelation || mongoose.model("RuleRelation", ruleRelationSchema);
