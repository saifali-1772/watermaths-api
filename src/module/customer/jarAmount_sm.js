const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const data = new mongoose.Schema({

    customer: mongoose.Schema.ObjectId,
    date: String,
    amount: Number,
    amountType: String,
    amountImage: String

})

module.exports = mongoose.model('jarAmount',data)