require("dotenv").config()
const express=require("express");
const path=require("path")
const hbs=require("hbs");
const register=require("../src/models/register");
const bcrypt=require("bcryptjs")
const cookieParser=require("cookie-parser")
const auth=require("./middleware/auth")

const app=express();
require("./db/conn")

const port=process.env.PORT || 3000

const staticPath=path.join(__dirname,"../public")
const templatePath=path.join(__dirname,"../templates/views")
const partialsPath=path.join(__dirname,"../templates/partials")


app.set("view engine","hbs")
app.set("views",templatePath)
hbs.registerPartials(partialsPath)

app.use(express.static(staticPath))
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))

app.get("/",(req,res)=>{
    res.render("index")
})

app.get("/secret",auth,(req,res)=>{
    // console.log("the cookie is" + req.cookies.jwtok)
    res.render("secret")
})

app.get("/register",(req,res)=>{
     res.render("register")
})

app.post("/register",async(req,res)=>{
   try{
    const password=req.body.password;
    const cpassword=req.body.cpassword;
    if(password===cpassword){
        const registerEmployee=new register({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            phone:req.body.phone,
            password:password,
            cpassword:cpassword,
            gender:req.body.gender
        })
       //middleware

       console.log("the registered employee is:",registerEmployee)


       const token=await registerEmployee.generateAuthToken()
       console.log("the token part is" + token)

       //the res.cookie() function is used to set the ookie name to a value.
       //the value parameter may be as string or object onverted to Json
       //syntax res.cookie(name,value,[options])

       res.cookie("jwt",token,{
           expires:new Date(Date.now + 30000),//cookie will expire in 30sec
           httpOnly:true  //Well, there is a way to protect cookies from most malicious JavaScript: HttpOnly cookies. When you tag a cookie with the HttpOnly flag, it tells the browser that this particular cookie should only be accessed by the server. Any attempt to access the cookie from client script is strictly forbidden
       })

   
       const registered=await registerEmployee.save();
        
       res.status(201).render("index")
        }else{
            res.send("Passwords are not matching")
        }
   }catch(err){
       res.status(400).send(err)
   }
    
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/logout",auth,async(req,res)=>{
    try{
       console.log(req.user)
   //logout from single device
   
       //removing current token from db
    // req.user.tokens=req.user.tokens.filter((currElem)=>{
    //     return currElem.token!==req.token
    // })

    //logout  from all devies i.e removing all token from db

    req.user.tokens=[]

    res.clearCookie("jwtok")

    console.log("logout Successfully")

    await req.user.save()

    res.render("login")
    }catch(err){
        res.status(501).send(err)
    }
})

app.post("/login",async(req,res)=>{
    try{
        const password=req.body.password;
        const email=req.body.email;
        const useremail=await register.findOne({email:email})

        const token=await useremail.generateAuthToken();
        console.log("the token part is" + token)


        res.cookie("jwtok",token,{
            expires:new Date(Date.now + 500000),
            httpOnly:true
        })
    
        const isMatch=await bcrypt.compare(password,useremail.password)


        //without hashing
        // if(useremail.password===password){
        //     res.status(201).render("index")
        // }
        //with hashing
        if(isMatch){
            res.status(201).render("index")
        }else{
            res.send("Invalid login or password")
        }

    }catch(e){
        res.status(400).send("invalid login details")
    }
})

app.listen(port,()=>{
    console.log(`connected at port ${port}`)
})