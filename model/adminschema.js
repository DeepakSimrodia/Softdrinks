const mongoose=require("mongoose")
const passportLocalMongoose = require('passport-local-mongoose');

const adminSchema=new mongoose.Schema({
    username:String,
    productName:String,
    productPrize:String,
    productImg:String,
    password:String
})

adminSchema.plugin(passportLocalMongoose)
const admin=mongoose.model("admin",adminSchema)
module.exports=admin
