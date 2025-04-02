import connectDb from "../db.js"

export const getname = (req,res)=>{
    res.json({message:"new respond",isSuccess:true,data:connectDb})
}