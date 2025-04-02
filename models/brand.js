import mongoose from 'mongoose';

const brandschema = new mongoose.Schema({
  brand_name: {
    type: String,
    trim: true,
    index: true  // ✅ Index for faster searches and uniqueness enforcement (if needed)
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true  // ✅ Index for fast shop-specific queries
  },
  brand_status: {
    type: String,
    enum: ['Active', 'Draft'],
    default: 'Draft',
    index: true  // ✅ Index if you often filter by brand status
  }
}, {
  timestamps: true
});

// Optional compound index if you frequently filter by both shop and status
brandschema.index({ shop_id: 1, brand_status: 1 });

export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandschema);
