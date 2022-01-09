const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const data = new mongoose.Schema({

    full_name:{
        type:String,
        required:true
    },
    
    mobile:{
        type:String,
        required:true,
    },

    address:{
        type:String,
        required:true
    },

    city:{
        type:String,
        required:true
    },

    pin_code:{
        type:String,
        required:true
    },

    partner:{
        type: mongoose.Schema.ObjectId, ref: 'partners',
        required:true
    },

    owner:{
        type: mongoose.Schema.ObjectId, ref: 'owners',
        required:true
    },
    
    ltr18:{
        type:Number,
        required:true
    },

    ltr20:{
        type:Number,
        required:true
    },

    totalAmount:Number

})


// data.pre("save",async function(next){
//     if(this.isModified('password')){
//         this.password = await bcrypt.hash(this.password,10)
//     }
//     next()
// })


module.exports = mongoose.model('customer',data)