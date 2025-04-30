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
import mongoose from "mongoose";
import axios from "axios";
import connectDb from "../db.js";


export const categorylist = async(req,res)=>{
  await connectDb();
  try {

    const shopid = req.get("Authorization"); // or req.headers['authorization']

    const myId = shopid?.split(" ")[1]; // Extract the shopId from the token
     if(!myId){
       return res.status(401).json({ message: "Unauthorized access" });
     }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';
    const sortBy = req.query.sortBy || 'title'; // default title
    const order = req.query.order === 'desc' ? -1 : 1; // default ascending
    const channel = req.query.channel;
    const type = req.query.category_type;
    const shopId = new mongoose.Types.ObjectId(myId); // Convert to ObjectId
    const matchStage = {shop_id: shopId}; // Match stage for aggregation pipeline};
    const andConditions = [];

    if (searchQuery) {
      const searchWords = searchQuery.trim().split(/\s+/);
      const searchConditions = searchWords.map((word) => ({
        title: { $regex: word, $options: "i" }
      }));
      andConditions.push(...searchConditions);
  
    }
    if (channel && channel!=="all") {
      andConditions.push({
        $or: [
          { publish_status: channel },
          { publish_status: { $in: [channel] } }
        ]
      });
    }
    if (type && type!=="all") {
      andConditions.push({
        $or: [
          { category_type: type },
         
        ]
      });
    }


    if (andConditions.length > 0) {
      matchStage.$and = andConditions;
    }
    const totalCountPromise = Category.countDocuments(matchStage);

    const categoriesAggPromise = Category.aggregate([
      { $match: matchStage },
      { $sort: { [sortBy]: order } }, // 🛠️ yahan dynamic sort add kiya
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: 'products_id',
          foreignField: '_id',
          as: 'products_id',
        },
      },
      {
        $lookup: {
          from: 'ruleconditions',
          localField: 'rules',
          foreignField: '_id',
          as: 'rules',
          pipeline: [
            {
              $lookup: {
                from: 'rulecolumns',
                localField: 'column',
                foreignField: '_id',
                as: 'column',
              },
            },
            { $unwind: { path: '$column', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'rulerelations',
                localField: 'relation',
                foreignField: '_id',
                as: 'relation',
              },
            },
            { $unwind: { path: '$relation', preserveNullAndEmptyArrays: true } },
          ],
        },
      },
    ]).collation({ locale: "en", strength: 1 }).exec();

    const [totalCount, categories] = await Promise.all([
      totalCountPromise,
      categoriesAggPromise,
    ]);

    const categoriesWithRules = await Promise.all(
      categories.map(async (category) => {
        const formattedRules = category.rules.map((rule) => {
          const ruleName = rule.column?.name || '';
          const ruleRelation = rule.relation?.name || '';
          const ruleValue = rule.value || '';
          return {
            concatenatedRule: `${ruleName} ${ruleRelation} ${ruleValue}`.trim(),
          };
        });

        let totalProductCount = 0;

        if (category.category_type === 'smart') {
          try {
            const resp = await axios.get(
              `https://adapis.truewebcart.com/api/countpro/${category.handle}`
            );
            totalProductCount = resp.data.totalproduct || 0;
          } catch (err) {
            console.error('Error counting smart category products:', err.message);
          }
        }

        return {
          ...category,
          rules: formattedRules,
          totalProductCount,
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      success: true,
      categories: categoriesWithRules,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}


// get category by id
export const getCategoryById = async (req, res) => {

  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID' });
    }

    const categoryData = await Category.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      // Lookup products
      {
        $lookup: {
          from: 'products', // collection name in MongoDB
          localField: 'products_id',
          foreignField: '_id',
          as: 'products_id',
        },
      },

      // Lookup rules
      {
        $lookup: {
          from: 'ruleconditions',
          localField: 'rules',
          foreignField: '_id',
          as: 'rules',
        },
      },

      // Lookup columns for each rule
      {
        $lookup: {
          from: 'rulecolumns',
          localField: 'rules.column',
          foreignField: '_id',
          as: 'columns',
        },
      },

      // Lookup relations for each rule
      {
        $lookup: {
          from: 'rulerelations',
          localField: 'rules.relation',
          foreignField: '_id',
          as: 'relations',
        },
      },

      // Add formatted rules
      {
        $addFields: {
          rules: {
            $map: {
              input: '$rules',
              as: 'rule',
              in: {
                rule_id: '$$rule.column',
                rule_name: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: '$columns',
                        as: 'col',
                        in: {
                          $cond: [
                            { $eq: ['$$col._id', '$$rule.column'] },
                            '$$col.name',
                            null,
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
                relation_id: '$$rule.relation',
                rule_relation: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: '$relations',
                        as: 'rel',
                        in: {
                          $cond: [
                            { $eq: ['$$rel._id', '$$rule.relation'] },
                            '$$rel.name',
                            null,
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
                rule_value: '$$rule.value',
              },
            },
          },
        },
      },

      // Final project
      {
        $project: {
          _id: 1,
          collection_id: 1,
          title: 1,
          handle: 1,
          cat_image: 1,
          meta_title: 1,
          meta_desc: 1,
          body_html: 1,
          shop_id: 1,
          category_type: 1,
          condition_id: 1,
          products_id: 1,
          publish_status: 1,
          sorting: 1,
          rules: 1,
          logicalOperator:1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!categoryData.length) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    return res.json({ success: true, category: categoryData[0] });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};