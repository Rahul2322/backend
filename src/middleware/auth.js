const jwt=require("jsonwebtoken")
const register=require("../models/register")


const auth=async function(req,res,next){
    try{
    const token =req.cookies.jwtok
    const verifyUser=jwt.verify(token,process.env.SECRET_KEY)
    // console.log(verifyUser)
    const user=await register.findOne({_id:verifyUser._id})
    // console.log(user)
    req.token=token
    req.user=user
    next()
    }catch(err){
        res.status(401).send(err)
    }
}

module.exports=auth