// import { Brand } from "../models/brand.js";
// import { Category } from "../models/category.js";
// import { Product } from "../models/product.js";
// import { ProductType } from "../models/product_type.js";
// import { Stock } from "../models/stock.js";
// import { Tag } from "../models/tags.js";
// import { Variant } from "../models/variant.js";
// import { Variantdetail } from "../models/variantdetail.js";
// import {RuleColumn} from "../models/rulecolumn.js";
// import { RuleCondition } from "../models/rulecondition.js";
// import { RuleRelation } from "../models/rulerelation.js";
// import NodeCache from "node-cache";
// const cache = new NodeCache({ stdTTL: 600 }); // cache expires in 10 minutes (600s)

// // Helper: Fetch variant details and stock in parallel
// const getVariantData = async (variant) => {
//   const [variantDetails, stock] = await Promise.all([
//     Variantdetail.find({ variant_id: variant._id }),
//     Stock.findOne({ variant_id: variant._id })
//   ]);
//   const options = variantDetails.map(detail => ({
//     id: detail._id,
//     name: detail?.Options,
//     values: detail?.option_values || []
//   }));
//   return {
//     ...variant._doc,
//     options,
//     stock: stock ? stock.quantity : 0,
//     stockId: stock?._id,
//     location_id: stock?.location_id
//   };
// };

// // Helper: Aggregate options from variant data
// const aggregateOptions = (variants) => {
//   const combinedOptions = variants.reduce((acc, variant) => acc.concat(variant.options), []);
//   const groupedOptions = {};
//   combinedOptions.forEach(option => {
//     // Normalize option name (if it’s an array, take the first element)
//     const optionName = Array.isArray(option.name) ? option.name[0] : option.name;
//     // Normalize option values (if nested, take the proper value)
//     const optionValues = Array.isArray(option.values) &&
//       option.values.length > 0 &&
//       Array.isArray(option.values[0])
//       ? option.values.map(val => (Array.isArray(val) ? val[1] : val))
//       : option.values;
//     if (groupedOptions[optionName]) {
//       groupedOptions[optionName].values = Array.from(new Set([...groupedOptions[optionName].values, ...optionValues]));
//     } else {
//       groupedOptions[optionName] = { ...option, name: optionName, values: optionValues };
//     }
//   });
//   return Object.values(groupedOptions).map(opt => ({
//     ...opt,
//     values: Array.isArray(opt.values)
//       ? opt.values.map(val => (Array.isArray(val) ? val[1] : val))
//       : (opt.values ? [opt.values] : [])
//   }));
// };

// // Helper: Transform a product object using its variants
// const transformProduct = (product, variants, categoryId = null) => {
//   const aggregatedOptions = aggregateOptions(variants);
//   const variantImages = variants.map(variant => variant.variant_image).filter(Boolean);
//   return {
//     cat_id: categoryId,
//     image: product.featured_image,
//     pro_id: product._id,
//     title: product.title,
//     body_html: product.body_html,
//     vendor: product.brand_name?.brand_name || null,
//     product_type: product.product_type?.product_type_name || null,
//     handle: product.handle,
//     tags: product.tags.map(tag => tag.tag_name).join(", ") || null,
//     options: aggregatedOptions,
//     images: variantImages,
//     variants: variants
//   };
// };

// // Helper: Fetch product details (variants and aggregated options)
// const getProductData = async (productExists) => {
//   const variants = await Variant.find({ product_id: productExists._id });
//   const variantData = await Promise.all(variants.map(getVariantData));
//   const productData = {
//     title: productExists.title,
//     body_html: productExists.body_html,
//     vendor: productExists.brand_name?.brand_name || null,
//     product_type: productExists.product_type?.product_type_name || null,
//     handle: productExists.handle,
//     tags: productExists.tags.map(tag => tag.tag_name).join(", ") || null,
//     options: aggregateOptions(variantData),
//     variants: variantData
//   };
//   return { productData, variantData };
// };

// // Helper: Get related products with their variants and options
// const getRelatedProducts = async (productExists, limit = 12) => {
//   if (!productExists.product_type) return [];
//   const relatedProducts = await Product.find({
//     product_type: productExists.product_type._id,
//     _id: { $ne: productExists._id }
//   })
//     .limit(limit)
//     .populate({ path: 'brand_name' })
//     .populate({ path: 'tags' })
//     .populate({ path: 'product_type' });
  
//   const relatedProductIds = relatedProducts.map(product => product._id);
//   const relatedVariants = await Variant.find({ product_id: { $in: relatedProductIds } });
//   const relatedVariantData = await Promise.all(relatedVariants.map(getVariantData));
  
//   return relatedProducts.map(product => {
//     const productVariants = relatedVariantData.filter(
//       variant => String(variant.product_id) === String(product._id)
//     );
//     return transformProduct(product, productVariants);
//   });
// };

// // const allCategory = async (req, res) => {
// //   try {
// //     const { handle } = req.params;
// //     let type = "Category";
    
// //     // Try to find a category by handle and populate rules
// //     let existhandle = await Category.findOne({ handle }).populate({
// //       path: 'rules',
// //       populate: [{ path: 'column' }, { path: 'relation' }]
// //     });
    
// //     // If no category exists, check in products
// //     if (!existhandle) {
// //       type = "Product";
// //       const productExists = await Product.findOne({ handle })
// //         .populate({ path: 'brand_name' })
// //         .populate({ path: 'tags' })
// //         .populate({ path: 'product_type' });
      
// //       if (!productExists) {
// //         return res.json({ message: "No data found", status: false, type: null });
// //       }
      
// //       // Fetch product data and related products concurrently
// //       const [productResult, relatedProducts] = await Promise.all([
// //         getProductData(productExists),
// //         getRelatedProducts(productExists)
// //       ]);
// //       const productData = productResult.productData;
// //       return res.json({
// //         success: true,
// //         slug: handle,
// //         type,
// //         sproduct: {
// //           single_product: productData,
// //           related_product: relatedProducts
// //         }
// //       });
// //     }
    
// //     // Build filters based on category rules
// //     let filters = {};
// //     for (const rule of existhandle.rules) {
// //       let fieldName = rule.column?.name;
// //       if (fieldName === "type") fieldName = "product_type";
// //       else if (fieldName === "tag") fieldName = "tags";
// //       else if (fieldName === "vendor") fieldName = "brand_name";
  
// //       const relation = rule.relation?.name;
// //       const value = rule.value;
// //       if (!fieldName || !relation || value === undefined) continue;
  
// //       switch (relation) {
// //         case "equals":
// //           filters[fieldName] = value;
// //           break;
// //         case "is not equal to":
// //           filters[fieldName] = { $ne: value };
// //           break;
// //         case "starts with":
// //           filters[fieldName] = { $regex: `^${value}`, $options: "i" };
// //           break;
// //         case "ends with":
// //           filters[fieldName] = { $regex: `${value}$`, $options: "i" };
// //           break;
// //         case "contains":
// //           filters[fieldName] = { $regex: value, $options: "i" };
// //           break;
// //         case "does not contain":
// //           filters[fieldName] = { $not: { $regex: value, $options: "i" } };
// //           break;
// //         case "is greater than":
// //           filters[fieldName] = { $gt: value };
// //           break;
// //         case "is less than":
// //           filters[fieldName] = { $lt: value };
// //           break;
// //         default:
// //           console.warn(`Unknown relation: ${relation}`);
// //           break;
// //       }
// //     }
    
// //     // Perform lookups concurrently for filters that require an ID conversion
// //     const lookupPromises = [];
// //     if (filters.product_type) {
// //       lookupPromises.push(
// //         ProductType.findOne({ product_type_name: filters.product_type }).then(pt => {
// //           if (pt) filters.product_type = pt._id;
// //         })
// //       );
// //     }
// //     if (filters.tags) {
// //       lookupPromises.push(
// //         Tag.findOne({ tag_name: filters.tags }).then(tag => {
// //           if (tag) filters.tags = tag._id;
// //         })
// //       );
// //     }
// //     if (filters.brand_name) {
// //       lookupPromises.push(
// //         Brand.findOne({ brand_name: filters.brand_name }).then(brand => {
// //           if (brand) filters.brand_name = brand._id;
// //         })
// //       );
// //     }
// //     await Promise.all(lookupPromises);
    
// //     // Find products using the built filters
// //     const products = await Product.find(filters)
// //       .populate({ path: 'brand_name' })
// //       .populate({ path: 'tags' })
// //       .populate({ path: 'product_type' })
// //       .limit(12);
    
// //     if (!products || products.length === 0) {
// //       return res.json({ message: "No products found", status: false, type, totalCount: 0 });
// //     }
    
// //     // Fetch variants for all matching products
// //     const productIds = products.map(p => p._id);
// //     const variants = await Variant.find({ product_id: { $in: productIds } });
// //     const variantData = await Promise.all(variants.map(getVariantData));
    
// //     const transformedProducts = products.map(product => {
// //       const productVariants = variantData.filter(v => String(v.product_id) === String(product._id));
// //       return transformProduct(product, productVariants, existhandle._id);
// //     });
    
// //     const transformedData = {
// //       cat_id: existhandle._id,
// //       cat_title: existhandle.title,
// //       cat_products: transformedProducts,
// //       totalCount: transformedProducts.length
// //     };
    
// //     return res.json({
// //       message: "Successfully fetched",
// //       status: true,
// //       type,
// //       catpros: transformedData
// //     });
    
// //   } catch (err) {
// //     console.error("Error fetching product:", err);
// //     return res.json({ message: err.message, status: false });
// //   }
// // };
// const allCategory = async (req, res) => {
//   try {
//     const { handle } = req.params;
//     const cacheKey = `category_or_product_${handle}`;
    
//     // Return from cache if exists
//     const cachedData = cache.get(cacheKey);
//     if (cachedData) {
//       return res.json({ ...cachedData, cached: true });
//     }

//     let type = "Category";

//     let existhandle = await Category.findOne({ handle }).populate({
//       path: 'rules',
//       populate: [{ path: 'column' }, { path: 'relation' }]
//     });

//     if (!existhandle) {
//       type = "Product";
//       const productExists = await Product.findOne({ handle })
//         .populate({ path: 'brand_name' })
//         .populate({ path: 'tags' })
//         .populate({ path: 'product_type' });

//       if (!productExists) {
//         return res.json({ message: "No data found", status: false, type: null });
//       }

//       const [productResult, relatedProducts] = await Promise.all([
//         getProductData(productExists),
//         getRelatedProducts(productExists)
//       ]);

//       const productData = productResult.productData;

//       const response = {
//         success: true,
//         slug: handle,
//         type,
//         sproduct: {
//           single_product: productData,
//           related_product: relatedProducts
//         }
//       };

//       cache.set(cacheKey, response); // Store in cache
//       return res.json(response);
//     }

//     let filters = {};
//     for (const rule of existhandle.rules) {
//       let fieldName = rule.column?.name;
//       if (fieldName === "type") fieldName = "product_type";
//       else if (fieldName === "tag") fieldName = "tags";
//       else if (fieldName === "vendor") fieldName = "brand_name";

//       const relation = rule.relation?.name;
//       const value = rule.value;
//       if (!fieldName || !relation || value === undefined) continue;

//       switch (relation) {
//         case "equals":
//           filters[fieldName] = value;
//           break;
//         case "is not equal to":
//           filters[fieldName] = { $ne: value };
//           break;
//         case "starts with":
//           filters[fieldName] = { $regex: `^${value}`, $options: "i" };
//           break;
//         case "ends with":
//           filters[fieldName] = { $regex: `${value}$`, $options: "i" };
//           break;
//         case "contains":
//           filters[fieldName] = { $regex: value, $options: "i" };
//           break;
//         case "does not contain":
//           filters[fieldName] = { $not: { $regex: value, $options: "i" } };
//           break;
//         case "is greater than":
//           filters[fieldName] = { $gt: value };
//           break;
//         case "is less than":
//           filters[fieldName] = { $lt: value };
//           break;
//         default:
//           console.warn(`Unknown relation: ${relation}`);
//           break;
//       }
//     }

//     const lookupPromises = [];
//     if (filters.product_type) {
//       lookupPromises.push(
//         ProductType.findOne({ product_type_name: filters.product_type }).then(pt => {
//           if (pt) filters.product_type = pt._id;
//         })
//       );
//     }
//     if (filters.tags) {
//       lookupPromises.push(
//         Tag.findOne({ tag_name: filters.tags }).then(tag => {
//           if (tag) filters.tags = tag._id;
//         })
//       );
//     }
//     if (filters.brand_name) {
//       lookupPromises.push(
//         Brand.findOne({ brand_name: filters.brand_name }).then(brand => {
//           if (brand) filters.brand_name = brand._id;
//         })
//       );
//     }
//     await Promise.all(lookupPromises);

//     const products = await Product.find(filters)
//       .populate({ path: 'brand_name' })
//       .populate({ path: 'tags' })
//       .populate({ path: 'product_type' })
//       .limit(12);

//     if (!products || products.length === 0) {
//       return res.json({ message: "No products found", status: false, type, totalCount: 0 });
//     }

//     const productIds = products.map(p => p._id);
//     const variants = await Variant.find({ product_id: { $in: productIds } });
//     const variantData = await Promise.all(variants.map(getVariantData));

//     const transformedProducts = products.map(product => {
//       const productVariants = variantData.filter(v => String(v.product_id) === String(product._id));
//       return transformProduct(product, productVariants, existhandle._id);
//     });

//     const transformedData = {
//       cat_id: existhandle._id,
//       cat_title: existhandle.title,
//       cat_products: transformedProducts,
//       totalCount: transformedProducts.length
//     };

//     const response = {
//       message: "Successfully fetched",
//       status: true,
//       type,
//       catpros: transformedData
//     };

//     cache.set(cacheKey, response); // Cache final response
//     return res.json(response);

//   } catch (err) {
//     console.error("Error fetching product:", err);
//     return res.json({ message: err.message, status: false });
//   }
// };


// export default allCategory;

export const allCategory = (req,res)=>{
  res.json({message:"new ond"})
}
export default allCategory;