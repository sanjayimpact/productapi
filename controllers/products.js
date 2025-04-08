import { Product } from "../models/product.js";
import { Stock } from "../models/stock.js";
import { Variant } from "../models/variant.js";
import { Variantdetail } from "../models/variantdetail.js";
import { Tag } from "../models/tags.js";
import { ProductType } from "../models/product_type.js";
import { Brand } from "../models/brand.js";
import mongoose from "mongoose";
export const allproducts = async (req, res) => {
  const shopid = req.get("Authorization"); // or req.headers['authorization']

 const myId = shopid?.split(" ")[1]; // Extract the shopId from the token
  if(!myId){
    return res.status(401).json({ message: "Unauthorized access" });
  }
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      tag: selectedTag = "",
      sort,
      order = "asc",
      brands: rawBrands = [],
      types: rawTypes = [],
      status: rawStatus = [],
    } = req.query;

    const selectedBrands = Array.isArray(rawBrands) ? rawBrands : [rawBrands].filter(Boolean);
    const selectedTypes = Array.isArray(rawTypes) ? rawTypes : [rawTypes].filter(Boolean);
    const selectedStatus = Array.isArray(rawStatus) ? rawStatus : [rawStatus].filter(Boolean);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const shopId = new mongoose.Types.ObjectId(myId);

    // Construct match query
    let matchQuery = { shop_id: shopId };
    if (search) matchQuery.title = { $regex: search, $options: "i" };
    if (selectedTag) matchQuery.tags = new mongoose.Types.ObjectId(selectedTag);
    if (selectedBrands.length) matchQuery.brand = { $in: selectedBrands.map((id) => id.trim()) };
    if (selectedTypes.length) matchQuery.product_type_name = { $in: selectedTypes.map((id) => id.trim()) };
    if (selectedStatus.length) matchQuery.product_status = { $in: selectedStatus };

    // Construct sort object
    const sortField = sort === "title" || sort === "createdAt" || sort === "updatedAt" ? sort : "title";
    const sortQuery = { [sortField]: sortOrder };

    // Get total count
    const totalProducts = await Product.countDocuments(matchQuery);

    // Aggregation
    const products = await Product.aggregate([
      { $match: matchQuery },
      {
        $project: {
          publish_status: 0,
          meta_title: 0,
          meta_description: 0,
          body_html: 0,
          shop_id: 0,
          brand_name: 0,
          product_type: 0,
          product_id: 0,
          tags: 0,
        },
      },
      { $sort: sortQuery },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "variants",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$product_id", "$$productId"] }, { $eq: ["$isVariandetails", 1] }] } } },
            {
              $lookup: {
                from: "variantdetails",
                localField: "_id",
                foreignField: "variant_id",
                as: "variantDetails",
              },
            },
            {
              $lookup: {
                from: "stocks",
                localField: "_id",
                foreignField: "variant_id",
                as: "stockData",
              },
            },
            {
              $addFields: {
                Stock: { $ifNull: [{ $arrayElemAt: ["$stockData.quantity", 0] }, 0] },
              },
            },
            { $project: { stockData: 0 } },
          ],
          as: "variants",
        },
      },
      {
        $lookup: {
          from: "variants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$product_id", "$$productId"] }, { $eq: ["$isdefault", true] }],
                },
              },
            },
            {
              $lookup: {
                from: "stocks",
                localField: "_id",
                foreignField: "variant_id",
                as: "stockData",
              },
            },
            {
              $addFields: {
                defaultstock: { $ifNull: [{ $arrayElemAt: ["$stockData.quantity", 0] }, 0] },
              },
            },
            { $project: { stockData: 0 } },
          ],
          as: "defaultVariant",
        },
      },
      {
        $addFields: {
          defaultstock: {
            $cond: {
              if: { $gt: [{ $size: "$defaultVariant" }, 0] },
              then: { $arrayElemAt: ["$defaultVariant.defaultstock", 0] },
              else: 0,
            },
          },
        },
      },
      { $project: { defaultVariant: 0 } },
    ]);

    return res.json({
      message: "Successfully fetched",
      data: products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: err.message });
  }
};
