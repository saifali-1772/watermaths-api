const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const data = new mongoose.Schema({

    company_name:{
        type:String,
        // required:true,
    },

    full_name:{
        type:String
        // required:true
    },
    
    email:{
        type:String,
        // required:true,
        unique:[true,"This email is already exist"],
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is Invalid")
            }
        }
    },

    mobile:{
        type:Number,
        // required:true,
        // unique:[true,"This mobile no is already exist"]
    },

    password:{
        type:String,
        // required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter Strong Password")
            }
        }
    },

    address:{
        type:String,
        // required:true
    },

    city:{
        type:String,
        // required:true
    },

    pin_code:{
        type:Number,
        // required:true
    },

    ltr20:{
        type:Number,
    },

    ltr18:{
        type:Number,
    },
    
    missing:{
        type:Number,
    },
    
    extra:{
        type:Number,
    },

})


data.pre("save",async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10)
    }
    next()
})


module.exports = mongoose.model('owner',data)