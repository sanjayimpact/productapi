import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  tag_name: {
    type: String,
    trim: true,
    required: true,
    index: true  // ✅ Fast tag search and autocomplete
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true  // ✅ Filter tags by shop
  },
  tag_status: {
    type: String,
    enum: ['Active', 'Draft'],
    default: 'Draft',
    index: true  // ✅ Common filtering for backend or UI
  }
}, { timestamps: true });


tagSchema.index({ tag_name: 1, shop_id: 1 }, { unique: true });

export const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
