const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken")

const registerSchema=new mongoose.Schema({
firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                 throw new Error
            }
        }
    },
    phone:{
        type:Number,
        required:true,
        minlength:10,
        maxlength:10
    },
    gender:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]

})

// middleware

//creating authentification token
registerSchema.methods.generateAuthToken=async function(){
    try{
        console.log(this._id)
        const token=await jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY)
        // console.log(token);
        this.tokens=this.tokens.concat({token:token})
        await this.save()
        return token
    }catch(err){
        res.send(err)
    }
}




//password hashing for security before saving
registerSchema.pre("save",async function(next){
    if(this.isModified("password")){
        console.log(`current password is ${this.password} `)

        this.password=await bcrypt.hash(this.password,10)

        console.log(`current password is ${this.password} `)

        // this.cpassword=undefined//here iam undefining bcoz after hashing the password i dont need cpassword in databse as plain password actual text 
        this.cpassword=await bcrypt.hash(this.password,10)
    }
    next();//next is function of middleware to go to next if password update is not required
})

const Register=new mongoose.model("Register",registerSchema)

module.exports=Register