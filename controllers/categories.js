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
        
    
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || '';
    
        const matchStage = searchQuery
          ? { title: { $regex: `^${searchQuery}`, $options: 'i' } }
          : {};
    
        // Count total matching documents
        const totalCountPromise = Category.countDocuments(matchStage);
    
        // Aggregation for fetching paginated categories with rules & products populated
        const categoriesAggPromise = Category.aggregate([
          { $match: matchStage },
          { $sort: { createdAt: -1 } },
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
        ]).exec();
    
        const [totalCount, categories] = await Promise.all([
          totalCountPromise,
          categoriesAggPromise,
        ]);
    
        // Map and format categories
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
                  `https://testadminapi.hopto.org/api/countpro/${category.handle}`
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