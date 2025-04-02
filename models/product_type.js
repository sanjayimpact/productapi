import mongoose from "mongoose";

const productTypeSchema = new mongoose.Schema({
  product_type_name: {
    type: String,
    required: true,
    trim: true,
    index: true  // ✅ Useful for dropdowns, searches, filters
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true  // ✅ Filter by shop
  },
  product_type_status: {
    type: String,
    enum: ["Active", "Draft"],
    default: "Draft",
    index: true  // ✅ Often used in filtering
  }
}, { timestamps: true });

// Compound index for shop-wise product types
productTypeSchema.index({ shop_id: 1, product_type_name: 1 });

export const ProductType = mongoose.models.ProductType || mongoose.model("ProductType", productTypeSchema);
