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
    const shopId = new mongoose.Types.ObjectId('67c56189e4285a7d8c487efb');

    const products = await Product.aggregate([
      // Match products for the given shop_id.
      { $match: { shop_id: shopId } },
      
      // Populate brand_name.
      {
        $lookup: {
          from: "brands",
          localField: "brand_name",
          foreignField: "_id",
          as: "brand_name"
        }
      },
      { $unwind: { path: "$brand_name", preserveNullAndEmptyArrays: true } },
      
      // Populate product_type.
      {
        $lookup: {
          from: "producttypes",
          localField: "product_type",
          foreignField: "_id",
          as: "product_type"
        }
      },
      { $unwind: { path: "$product_type", preserveNullAndEmptyArrays: true } },
      
      // Populate tags (assumed to be an array).
      {
        $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tags"
        }
      },
      
      // Lookup variants for each product.
      {
        $lookup: {
          from: "variants",
          localField: "_id",
          foreignField: "product_id",
          as: "variants"
        }
      },
      
      // Lookup variant details for all variants of the product.
      {
        $lookup: {
          from: "variantdetails",
          let: { variantIds: "$variants._id" },
          pipeline: [
            { $match: { $expr: { $in: [ "$variant_id", "$$variantIds" ] } } }
          ],
          as: "variantDetails"
        }
      },
      
      // Lookup stocks for all variants of the product.
      {
        $lookup: {
          from: "stocks",
          let: { variantIds: "$variants._id" },
          pipeline: [
            { $match: { $expr: { $in: [ "$variant_id", "$$variantIds" ] } } }
          ],
          as: "stocks"
        }
      },
      
      // For each variant, merge its variant details and stock quantity.
      {
        $addFields: {
          variants: {
            $map: {
              input: "$variants",
              as: "variant",
              in: {
                $mergeObjects: [
                  "$$variant",
                  {
                    variantDetails: {
                      $filter: {
                        input: "$variantDetails",
                        as: "vd",
                        cond: { $eq: [ "$$vd.variant_id", "$$variant._id" ] }
                      }
                    },
                    Stock: {
                      $let: {
                        vars: {
                          matchingStock: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$stocks",
                                  as: "st",
                                  cond: { $eq: [ "$$st.variant_id", "$$variant._id" ] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: { $ifNull: [ "$$matchingStock.quantity", 0 ] }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      
      // Remove temporary arrays used for merging.
      { $project: { variantDetails: 0, stocks: 0 } }
    ]);

    return res.json({
      message: "Successfully fetched",
      data: products,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: err.message });
  }
};
