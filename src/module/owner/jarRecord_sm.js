const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const data = new mongoose.Schema({

    owner:{
        type:mongoose.Schema.ObjectId,
        // required:true,
    },

    date:{
        type:String,
        // required:true,  
    },
    
    ltr18:{
        type:Number,
        // required:true,
    },

    ltr20:{
        type:Number,
        // required:true,
    },

    type:{
        type:String,  
    },

    missing:{
        type:Number,
    },

    extra:{
        type:Number,
    },

})

module.exports = mongoose.model('ownerJarRecord',data)