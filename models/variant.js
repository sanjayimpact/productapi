import mongoose from 'mongoose';

const varianSchema = new mongoose.Schema({
  price: {
    type: String
  },
  compareprice: {
    type: String
  },
  sku: {
    type: String,
    unique: true,   // ✅ Unique index
    index: true     // ✅ Ensures fast lookup
  },
  costprice: {
    type: String
  },
  barcode: {
    type: String,
    index: true     // ✅ Useful for scanning or barcode-based search
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    index: true     // ✅ For filtering all variants of a product
  },
  variant_image: {
    type: String,
    trim: true
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true     // ✅ For multi-shop systems
  },
  isVariandetails: {
    type: Number,
    default: 0,
    index: true     // ✅ Could be used in filtering grouped vs. simple variants
  },
  istax: {
    type: Boolean,
    default: false,
    index: true     // ✅ Taxable vs non-taxable variants
  },
  isdefault: {
    type: Boolean,
    enum: [true, false],
    default: false,
    index: true     // ✅ Commonly queried to find default variant
  },
  weight: {
    type: String,
    trim: true
  },
  p_id: {
    type: Number,
    default: 0,
    index: true     // ✅ Useful for custom external ID matching
  }
}, { timestamps: true });

// Optional compound index if you often query by shop_id + product_id
varianSchema.index({ shop_id: 1, _id: 1 });

export const Variant = mongoose.models.Variant || mongoose.model('Variant', varianSchema);
