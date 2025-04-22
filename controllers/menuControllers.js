import { Brand } from "../models/brand.js";
import { Tag } from "../models/tags.js";
import { ProductType} from "../models/product_type.js";
import { Option } from "../models/optionName.js";
import mongoose from "mongoose";

//get all Option
// export const Alloption =async(req,res)=>{
// //     const shopid = req.get("Authorization"); // or req.headers['authorization']

// //  const myId = shopid?.split(" ")[1]; // Extract the shopId from the token
// //   if(!myId){
// //     return res.status(401).json({ message: "Unauthorized access" });
// //   }
//   try{
//       let{page,limit,search} = req.query;
//       const skip = (page - 1) * limit;
//       const query={shopId:'67c56189e4285a7d8c487efb'};
//       if(search)query.optionName={ $regex: search, $options: "i" };
//       const options = await Option.find(query).skip(skip).limit(limit).sort({optionName:1});
    
//       const totaloptions = await Option.countDocuments(query);
//       return res.json({message:"Successfully fetched",data:options,total:totaloptions,isSuccess:true})

//   }catch(err){
//     console.log(err);
//     return res.json({message:err?.message})
//   }
// }
export const Alloption = async (req, res) => {
    try {
      let { page = 1, limit = 10, search = "" } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;
  
      const shopId = new mongoose.Types.ObjectId("67c56189e4285a7d8c487efb"); // Replace with dynamic shopId later
  
      const matchStage = {
        shopId,
        ...(search && {
          optionName: { $regex: search.trim(), $options: "i" }
        })
      };
  
      const result = await Option.aggregate([
        { $match: matchStage },
        {
          $facet: {
            data: [
              { $sort: { optionName: 1 } },
              { $skip: skip },
              { $limit: limit }
            ],
            totalCount: [
              { $count: "count" }
            ]
          }
        }
      ]);
  
      const options = result[0].data;
      const total = result[0].totalCount[0]?.count || 0;
  
      return res.json({
        message: "Successfully fetched",
        data: options,
        total,
        isSuccess: true
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err?.message, isSuccess: false });
    }
  };

export const Alltags = async(req,res)=>{
    try {
        let { page = 1, limit = 10, search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;
    
        const shop_id = new mongoose.Types.ObjectId("67c56189e4285a7d8c487efb"); // Replace with dynamic shopId later
    
        const matchStage = {
          
shop_id,
          ...(search && {
            tag_name: { $regex: search.trim(), $options: "i" }
          })
        };
    
        const result = await Tag.aggregate([
          { $match: matchStage },
          {
            $facet: {
              data: [
                { $sort: { tag_name: 1 } },
                { $skip: skip },
                { $limit: limit }
              ],
              totalCount: [
                { $count: "count" }
              ]
            }
          }
        ]);
    
        const tags = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;
    
        return res.json({
          message: "Successfully fetched",
          data: tags,
          total,
          isSuccess: true
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err?.message, isSuccess: false });
      }
}
export const AllproductType = async(req,res)=>{
    try {
        let { page = 1, limit = 10, search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;
    
        const shop_id = new mongoose.Types.ObjectId("67c56189e4285a7d8c487efb"); // Replace with dynamic shopId later
    
        const matchStage = {
          
shop_id,
          ...(search && {
            product_type_name: { $regex: search.trim(), $options: "i" }
          })
        };
    
        const result = await ProductType.aggregate([
          { $match: matchStage },
          {
            $facet: {
              data: [
                { $sort: { product_type_name: 1 } },
                { $skip: skip },
                { $limit: limit }
              ],
              totalCount: [
                { $count: "count" }
              ]
            }
          }
        ]);
    
        const types = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;
    
        return res.json({
          message: "Successfully fetched",
          data: types,
          total,
          isSuccess: true
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err?.message, isSuccess: false });
      }
}
export const Allbrands = async(req,res)=>{
    try {
        let { page = 1, limit = 10, search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;
    
        const shop_id = new mongoose.Types.ObjectId("67c56189e4285a7d8c487efb"); // Replace with dynamic shopId later
    
        const matchStage = {
          
shop_id,
          ...(search && {
            brand_name: { $regex: search.trim(), $options: "i" }
          })
        };
    
        const result = await Brand.aggregate([
          { $match: matchStage },
          {
            $facet: {
              data: [
                { $sort: { brand_name: 1 } },
                { $skip: skip },
                { $limit: limit }
              ],
              totalCount: [
                { $count: "count" }
              ]
            }
          }
        ]);
    
        const brands = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;
    
        return res.json({
          message: "Successfully fetched",
          data: brands,
          total,
          isSuccess: true
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err?.message, isSuccess: false });
      }
}

