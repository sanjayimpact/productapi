import mongoose from "mongoose";

const ruleColumnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const RuleColumn = mongoose.models.RuleColumn || mongoose.model("RuleColumn", ruleColumnSchema);
