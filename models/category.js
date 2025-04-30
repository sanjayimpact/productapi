import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  collection_id: {
    type: Number,
    default: 0,
    index: true  // ✅ Often used in syncing, worth indexing
  },
  title: {
    type: String,
    index: true  // ✅ Useful for category search/autocomplete
  },
  handle: {
    type: String,
    index: true,  // ✅ Used in slugs/URLs
    unique: true  // 🔐 Ensures no duplicate handles
  },
  cat_image: {
    type: String
  },
  meta_title: {
    type: String
  },
  meta_desc: {
    type: String
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true  // ✅ Shop-based filtering
  },
  category_type: {
    type: String,
    enum: ["smart", "manual"]
  },
  publish_status: {
    type: String,
    enum: ["online_store", "Other"],
    default: "online_store",
    index: true  // ✅ Useful for filtering published categories
  },
  body_html: {
    type: String
  },
  logicalOperator:{
    type:String,
    enum:["AND","OR"],
    default:"AND"
},
  rules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RuleCondition'
  }],
  products_id: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  }],
  sorting: {
    type: String,
    enum: [
      "best_selling",
      "asc",
      "desc",
      "price_desc",
      "price_asc",
      "newest",
      "oldest",
      "manual"
    ],
    default: "best_selling"
  }
}, {
  timestamps: true
});

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
