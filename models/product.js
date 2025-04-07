import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    index: true  // ✅ Fast search/autocomplete on title
  },
  handle: {
    type: String,
    trim: true,
    index: true,  // ✅ Used in URLs / slugs
    unique: true  // 🔐 Optional: ensure unique handles
  },
  publish_status: {
    type: String,
    trim: true,
    enum: ['Online Store', 'Other'],
    index: true  // ✅ Filter by publish status
  },
  meta_title: {
    type: String,
    trim: true
  },
  meta_description: {
    type: String
  },
  body_html: {
    type: mongoose.Schema.Types.Mixed,
    trim: true
  },
  featured_image: {
    type: String
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true  // ✅ Multi-tenant architecture or shop-based filtering
  },
  product_status: {
    type: String,
    enum: ['Active', 'Draft'],
    default: 'Draft',
    index: true  // ✅ Filter by status
  },
  brand_name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    index: true  // ✅ Brand filters
  },
  brand:{
    type:String,
    index:true
  },
  product_type_name:{
    type:String,
    index:true
  },


  product_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductType',
    index: true  // ✅ Useful for type-based filtering
  },
  product_id: {
    type: Number,
    index: true  // ✅ External sync (like Shopify) or custom ID search
  }, tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    default: [],
   
  }],

}, { timestamps: true });

// Optional compound index (if you frequently filter products by shop and status)
productSchema.index({ shop_id: 1, product_status: 1 });

// Optional compound index for search/autocomplete
// productSchema.index({ title: "text", meta_title: "text", meta_description: "text" });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
