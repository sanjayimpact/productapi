import { Product } from "../models/product.js";
import { Stock } from "../models/stock.js";
import { Variant } from "../models/variant.js";
import { Variantdetail } from "../models/variantdetail.js";
import { Tag } from "../models/tags.js";
import { ProductType } from "../models/product_type.js";
import { Brand } from "../models/brand.js";
import mongoose from "mongoose";
export const allproducts = async (req, res) => {
  try {
    
    const {
      page = 1,
      limit = 50,
      search = "",
      tag: selectedTag = "",
      sort,
      order = "desc",
      brands: rawBrands = [],
      types: rawTypes = [],
      status: rawStatus = [],
    } = req.query;
    



    const selectedBrands = Array.isArray(rawBrands) ? rawBrands : [rawBrands].filter(Boolean);
    const selectedTypes = Array.isArray(rawTypes) ? rawTypes : [rawTypes].filter(Boolean);
    const selectedStatus = Array.isArray(rawStatus) ? rawStatus : [rawStatus].filter(Boolean);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // You should extract this from req.user after authenticating
    const shopId = req.user?.shopId || "67c56189e4285a7d8c487efb";

    // ✅ Construct Query Object
    let query = { shop_id: shopId };

    if (search) query.title = { $regex: search, $options: "i" };
    if (selectedTag) query.tags = selectedTag;
    if (selectedBrands.length > 0) query.brand = { $in: selectedBrands.map((id) => id.trim()) };
    if (selectedTypes.length > 0) query.product_type_name = { $in: selectedTypes.map((id) => id.trim()) };
    if (selectedStatus.length > 0) query.product_status = { $in: selectedStatus };

    // ✅ Sort Query
  
    let sortQuery = {};
    if (sort === "title" || sort === "createdAt" || sort === "updatedAt") {
      sortQuery[sort] = sortOrder;
    }

    // ✅ Total count after filtering
    const totalProducts = await Product.countDocuments(query);

    // ✅ Fetch filtered products
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))

  
   
    // ✅ Process Variants and Stock
    const responseData = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find({
          product_id: product._id,
          isVariandetails: 1,
        });

        const defaultVariant = await Variant.findOne({
          product_id: product._id,
          isdefault: true,
        });

        let defaultstock = 0;
        if (defaultVariant) {
          const stockEntry = await Stock.findOne({ variant_id: defaultVariant._id });
          defaultstock = stockEntry ? stockEntry.quantity : 0;
        }

        const variantData = await Promise.all(
          variants.map(async (variant) => {
            const variantDetails = await Variantdetail.find({ variant_id: variant._id });
            const stockEntry = await Stock.findOne({ variant_id: variant._id });
            const variantStock = stockEntry ? stockEntry.quantity : 0;

            return {
              ...variant._doc,
              variantDetails,
              Stock: variantStock,
            };
          })
        );

        return {
          defaultstock,
          ...product._doc,
          variants: variantData,
        };
      })
    );

    // ✅ Final response
    return res.json({
      message: "Successfully fetched",
      data: responseData,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: err.message });
  }
};