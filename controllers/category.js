import { Brand } from "../models/brand.js";
import { Category } from "../models/category.js";
import { Product } from "../models/product.js";
import { ProductType } from "../models/product_type.js";
import { Stock } from "../models/stock.js";
import { Tag } from "../models/tags.js";
import { Variant } from "../models/variant.js";
import { Variantdetail } from "../models/variantdetail.js";
import {RuleColumn} from "../models/rulecolumn.js";
import { RuleCondition } from "../models/rulecondition.js";
import { RuleRelation } from "../models/rulerelation.js";

import connectDb from "../db.js";




// --- Helpers remain untouched but grouped for clarity ---
const getVariantData = async (variant) => {
  const [variantDetails, stock] = await Promise.all([
    Variantdetail.find({ variant_id: variant._id }),
    Stock.findOne({ variant_id: variant._id })
  ]);
  const options = variantDetails.map(detail => ({
    id: detail._id,
    name: detail?.Options,
    values: detail?.option_values || []
  }));
  return {
    ...variant._doc,
    options,
    stock: stock ? stock.quantity : 0,
    stockId: stock?._id,
    location_id: stock?.location_id
  };
};

const aggregateOptions = (variants) => {
  const combinedOptions = variants.reduce((acc, variant) => acc.concat(variant.options), []);
  const groupedOptions = {};
  combinedOptions.forEach(option => {
    const optionName = Array.isArray(option.name) ? option.name[0] : option.name;
    const optionValues = Array.isArray(option.values) &&
      option.values.length > 0 &&
      Array.isArray(option.values[0])
      ? option.values.map(val => (Array.isArray(val) ? val[1] : val))
      : option.values;
    if (groupedOptions[optionName]) {
      groupedOptions[optionName].values = Array.from(new Set([...groupedOptions[optionName].values, ...optionValues]));
    } else {
      groupedOptions[optionName] = { ...option, name: optionName, values: optionValues };
    }
  });
  return Object.values(groupedOptions).map(opt => ({
    ...opt,
    values: Array.isArray(opt.values)
      ? opt.values.map(val => (Array.isArray(val) ? val[1] : val))
      : (opt.values ? [opt.values] : [])
  }));
};

const transformProduct = (product, variants, categoryId = null) => {

  const aggregatedOptions = aggregateOptions(variants);
  return {
    cat_id: categoryId,
    image: product.featured_image,
    pro_id: product._id,
    title: product.title,
    body_html: product.body_html,

    vendor: product.brand || null,
    product_type: product.product_type_name || null,
    handle: product.handle,
    tags: product.tags.map(tag => tag.tag_name).join(", ") || null,
    options: aggregatedOptions,
    variants: variants
  };
};

const getProductData = async (productExists) => {
  const variants = await Variant.find({ product_id: productExists._id });
  const variantData = await Promise.all(variants.map(getVariantData));
  return {
    productData: {
      image: productExists.featured_image,
      title: productExists.title,
      brand:productExists?.brand,
      body_html: productExists.body_html,
      vendor: productExists.brand || null,
      product_type: productExists.product_type_name || null,
      handle: productExists.handle,
      tags: productExists.tags.map(tag => tag.tag_name).join(", ") || null,
      options: aggregateOptions(variantData),
      variants: variantData
    },
    variantData
  };
};

const getRelatedProducts = async (productExists, limit = 12) => {
  if (!productExists.product_type_name) return [];

  const relatedProducts = await Product.find({
    product_type_name: productExists.product_type_name,
    _id: { $ne: productExists._id }
  }).limit(limit).populate( 'tags');

  const relatedProductIds = relatedProducts.map(p => p._id);
  const relatedVariants = await Variant.find({ product_id: { $in: relatedProductIds } });
  const relatedVariantData = await Promise.all(relatedVariants.map(getVariantData));

  return relatedProducts.map(product => {
    const productVariants = relatedVariantData.filter(
      variant => String(variant.product_id) === String(product._id)
    );
    return transformProduct(product, productVariants);
  });
};

// --- Main Controller ---
const allCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { handle } = req.params;

    let type = "Category";

    // Check if handle belongs to a category
    let existhandle = await Category.findOne({ handle }).populate({
      path: "rules",
      populate: [{ path: "column" }, { path: "relation" }]
    });

    // If not category, check if it's a product
    if (!existhandle) {
      type = "Product";

      const productExists = await Product.findOne({ handle })
        .populate( "tags");

      if (!productExists) {
        return res.json({ message: "No data found", status: false, type: null });
      }

      const [productResult, relatedProducts] = await Promise.all([
        getProductData(productExists),
        getRelatedProducts(productExists)
      ]);

      return res.json({
        success: true,
        slug: handle,
        type,
        sproduct: {
          single_product: productResult.productData,
          related_product: relatedProducts
        }
      });
    }

    // Construct filters from rules
    let filters = {};

    for (const rule of existhandle.rules) {
      let field = rule.column?.name;
      const relation = rule.relation?.name;
      const value = rule.value;

      if (!field || !relation || value === undefined) continue;

      switch (field) {
        case "type": field = "product_type_name"; break;
        case "tag": field = "tags"; break;
        case "vendor": field = "brand"; break;
      }

      switch (relation) {
        case "equals": filters[field] = value; break;
        case "is not equal to": filters[field] = { $ne: value }; break;
        case "starts with": filters[field] = { $regex: `^${value}`, $options: "i" }; break;
        case "ends with": filters[field] = { $regex: `${value}$`, $options: "i" }; break;
        case "contains": filters[field] = { $regex: value, $options: "i" }; break;
        case "does not contain": filters[field] = { $not: { $regex: value, $options: "i" } }; break;
        case "is greater than": filters[field] = { $gt: value }; break;
        case "is less than": filters[field] = { $lt: value }; break;
        default: break;
      }
    }

    // Resolve references
    const [tagDoc] = await Promise.all([
      filters.product_type ? Product.findOne({ product_type_name: filters.product_type }) : null,
      filters.tags ? Tag.findOne({ tag_name: filters.tags }) : null,
      filters.brand_name ? Product.findOne({ brand: filters.brand_name }) : null
    ]);

    
    if (tagDoc) filters.tags = tagDoc._id;
   

    // Fetch products
    const [products, totalproduct] = await Promise.all([
      Product.find(filters)
        .populate("tags")
        .skip(skip).limit(limit).sort({ title: 1 }),
      Product.countDocuments(filters)
    ]);

    if (!products.length) {
      return res.json({
        message: "No products found",
        status: false,
        type,
        totalCount: 0
      });
    }

    const productIds = products.map(p => p._id);
    const variants = await Variant.find({ product_id: { $in: productIds } });
    const variantData = await Promise.all(variants.map(getVariantData));

    const transformedProducts = products.map(product => {
      const productVariants = variantData.filter(v => String(v.product_id) === String(product._id));
    
      return transformProduct(product, productVariants, existhandle._id);
    });

    const transformedData = {
      cat_id: existhandle._id,
      cat_title: existhandle.title,
      cat_products: transformedProducts,
      totalCount: transformedProducts.length,
      currentPage: page,
      totalPages: Math.ceil(totalproduct / limit),
      totalproduct
    };

    return res.json({
      message: "Successfully fetched",
      status: true,
      type,
      catpros: transformedData
    });

  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ message: err.message, status: false });
  }
};


export default allCategory;