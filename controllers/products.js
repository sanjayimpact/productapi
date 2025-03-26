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
    // Aggregate query to fetch products for a specific shop_id
    const shopId =new  mongoose.Types.ObjectId('67c56189e4285a7d8c487efb')
    const products = await Product.aggregate([
      { $match: { shop_id:shopId } },{
        $lookup:{
          from:"brands",
          localField:"brand_name",
          foreignField:"_id",
          as:"brand"
        }
      },
      {
        $lookup:{
          from:"tags",
          localField:"tags",
          foreignField:"_id",
          as:"tag"
        }
      },
      {
        $lookup:{
          from:"producttypes",
          localField:"product_type",
          foreignField:"_id",
          as:"product_type"
        }
      },
      {
        $lookup:{
          from :"variants",
          localField:"_id",
          foreignField:"product_id",
          as:"variants"
        }
      },{ 
        $unwind: { path: "$variants", preserveNullAndEmptyArrays: true }  // Unwind variants to make them accessible individually
      },
      {
        $lookup:{
          from :"variantdetails",
          localField:"variants._id",
          foreignField:"variant_id",
          as:"variant_details"
        }
      },{
        $lookup:{
          from :"stocks",
          localField:"variants._id",
          foreignField:"variant_id",
          as:"stocks"
        }
      }

    ]);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    // Return the fetched products
    res.json({ message: "Products fetched successfully.", data: products });

  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: "An error occurred while fetching products.", error: err.message });
  }
};

