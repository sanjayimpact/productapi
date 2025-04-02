import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    index: true  // ✅ For location-based stock lookups
  },
  quantity: {
    type: Number,
    default: 0
  },
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
    index: true  // ✅ Most common lookup (stock per variant)
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true  // ✅ For shop-level stock segmentation
  },
  isdefault: {
    type: Boolean,
    enum: [true, false],
    default: false,
    index: true  // ✅ To quickly get the default stock row
  }
}, { timestamps: true });

// Optional: Compound index for shop + variant + location
stockSchema.index({ shop_id: 1, variant_id: 1, location_id: 1 });

export const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);
