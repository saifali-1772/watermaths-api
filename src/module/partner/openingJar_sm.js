const mongoose = require('mongoose')

const data = new mongoose.Schema({

    partner:mongoose.Schema.ObjectId,
    date:String,
    ltr18:Number,
    ltr20:Number

})

module.exports = mongoose.model('openingJar',data)