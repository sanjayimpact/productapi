import connectDb from "../db.js"

export const getname = (req,res)=>{
    console.log(connectDb);
    res.json({message:"new respond",isSuccess:true})
}