import mongoose from "mongoose";

const variantdetailSchema = new mongoose.Schema({
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "variant",
    index: true  // ✅ Commonly used for filtering variant details
  },
  Options: {
    type: [String],
    index: true  // ✅ If you filter or search by option names
  },
  option_values: {
    type: Map,
    of: String  // ✅ Storing key-value option data
  },
  isdefault: {
    type: Boolean,
    enum: [true, false],
    default: false,
    index: true  // ✅ To find the default detail quickly
  }
});

// Optional compound index: e.g. one default per variant
variantdetailSchema.index({ variant_id: 1, isdefault: 1 });

export const Variantdetail = mongoose.models.Variantdetail || mongoose.model('Variantdetail', variantdetailSchema);
