const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const data = new mongoose.Schema({

    customer:{
        type:mongoose.Schema.ObjectId,
        // required:true,
    },

    date:{
        type:String,
        // required:true,  
    },
    
    filled_18:{
        type:Number,
        // required:true,
    },

    empty_18:{
        type:Number,
        // required:true,
    },

    stock_18:{
        type:Number,
        // required:true,
    },

    filled_20:{
        type:Number,
        // required:true,
    },

    empty_20:{
        type:Number,
        // required:true,
    },

    stock_20:{
        type:Number,
        // required:true,
    },

    

})

module.exports = mongoose.model('customerJarRecord',data)