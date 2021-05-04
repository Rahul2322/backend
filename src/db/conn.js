const mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/Youtuberegisteration",{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}).then(()=>{
    console.log("Connections successful")
}).catch((e)=>{
    console.log("Not Connected")
})