const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
// const validator = require('validator')

const data = new mongoose.Schema({

    username:{
        type:String,
        unique:true,
        // required:true,
    },

    full_name:{
        type:String,
        // required:true
    },
    
    mobile:{
        type:String,
        unique:true,
        // required:true,
    },

    partner_email:{
        type:String,
    },

    password:{
        type:String,
    },

    owner:{
        type: mongoose.Schema.ObjectId, ref: 'owners'
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
        type:String,
        // required:true
    },

    dob:{
        type:String,
        // required:true
    },

    ltr18:Number,
    ltr20:Number,
    missing:Number,
    extra:Number,

})


data.pre("save",async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10)
    }
    next()
})


module.exports = mongoose.model('partner',data)