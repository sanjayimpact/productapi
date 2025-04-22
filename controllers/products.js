import { Product } from "../models/product.js";
import { Stock } from "../models/stock.js";
import { Variant } from "../models/variant.js";
import { Variantdetail } from "../models/variantdetail.js";
import { Tag } from "../models/tags.js";
import { ProductType } from "../models/product_type.js";
import { Brand } from "../models/brand.js";
import mongoose from "mongoose";
import connectDb from "../db.js";
export const allproducts = async (req, res) => {
  await connectDb();
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
  let{filter} = req.query;
  
    const selectedBrands = Array.isArray(rawBrands) ? rawBrands : [rawBrands].filter(Boolean);
    const selectedTypes = Array.isArray(rawTypes) ? rawTypes : [rawTypes].filter(Boolean);
    const selectedStatus = Array.isArray(rawStatus) ? rawStatus : [rawStatus].filter(Boolean);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const shopId = new mongoose.Types.ObjectId(myId);
   

    // Construct match query
    const matchQuery = {
      shop_id: shopId,
      ...(filter && filter !== "All" && {
        product_status: filter === "Archived" ? "Archive" : filter,
      }),
    };
    
    if (search) matchQuery.title = { $regex: search, $options: "i" };
    if (selectedTag) matchQuery.tags = new mongoose.Types.ObjectId(selectedTag);
    if (selectedBrands.length) matchQuery.brand = { $in: selectedBrands.map((id) => id.trim()) };
    if (selectedTypes.length) matchQuery.product_type_name = { $in: selectedTypes.map((id) => id.trim()) };
    if (selectedStatus.length) matchQuery.product_status = { $in: selectedStatus };

    // Construct sort object
    const sortField = sort === "title" || sort === "createdAt" || sort === "updatedAt" ? sort : "1";
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

  export const getproductbyid = async(req,res)=>{
    try {
      const { id } = req.params;
  
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: "Valid product ID is required", data: [] });
      }
  
      // ✅ Aggregate Product with brand_name, tags, product_type populated
      const productAgg = await Product.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
      
        // Convert comma-separated publish_status string to array
        {
          $addFields: {
            publish_status: {
              $cond: {
                if: { $isArray: "$publish_status" },
                then: "$publish_status",
                else: {
                  $cond: {
                    if: { $ne: ["$publish_status", null] },
                    then: { $split: ["$publish_status", ","] },
                    else: []
                  }
                }
              }
            }
          }
        },
      
        {
          $lookup: {
            from: "brands",
            localField: "brand_name",
            foreignField: "_id",
            as: "brand_name",
          },
        },
        { $unwind: { path: "$brand_name", preserveNullAndEmptyArrays: true } },
      
        {
          $lookup: {
            from: "tags",
            localField: "tags",
            foreignField: "_id",
            as: "tags",
          },
        },
      
        {
          $lookup: {
            from: "producttypes",
            localField: "product_type",
            foreignField: "_id",
            as: "product_type",
          },
        },
        { $unwind: { path: "$product_type", preserveNullAndEmptyArrays: true } },
      ]);
  
      if (!productAgg || productAgg.length === 0) {
        return res.status(200).json({ message: "Product not found", data: [] });
      }
  
      const product = productAgg[0];
  
      // ✅ Aggregate variants, their details and stock
      const variantAgg = await Variant.aggregate([
        { $match: { product_id: new mongoose.Types.ObjectId(id) } },
  
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
            as: "stockInfo",
          },
        },
        {
          $addFields: {
            stock: {
              $ifNull: [{ $arrayElemAt: ["$stockInfo.quantity", 0] }, 0],
            },
            stockId: { $arrayElemAt: ["$stockInfo._id", 0] },
            location_id: { $arrayElemAt: ["$stockInfo.location_id", 0] },
          },
        },
        { $project: { stockInfo: 0 } }, // Clean up
      ]);
  
      const responseData = {
        ...product,
        variants: variantAgg,
      };
  
      return res.status(200).json({
        message: "Successfully fetched",
        data: responseData,
        isSuccess:true
      });
    } catch (err) {
      console.error("Error fetching product:", err);
      return res.status(500).json({ message: err.message });
    }
  }