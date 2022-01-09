// require dependencies
const express = require('express')
const route = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')

// use schema
const registration_sm = require('../../module/customer/customerReg_sm')

// middleware
route.use(express.json())
route.use(express.urlencoded({ extended: true }))

// create multer ( image upload code )
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images/category')
    },

    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 * 2 } // 1000000 Bytes = 1 MB
})


// add customer
route.post('/addCustomer', (req, res) => {

    const registration_var = new registration_sm({

        full_name: req.body.full_name,
        email: req.body.email,
        mobile: req.body.mobile,
        address: req.body.address,
        city: req.body.city,
        pin_code: req.body.pin_code,
        owner: req.body.owner,
        partner: req.body.partner,
        ltr20: req.body.ltr20,
        ltr18: req.body.ltr18,
        totalAmount: 0

    })

    // reg.generateAuthToken()

    registration_var.save((err, doc) => {
        if (!err) {
            return res.json({ data: doc })
        } else {
            return res.json({ message: err })
        }
    })

})

route.get('/getCustomer', (req, res) => {

    registration_sm.find((err, doc) => {
        if (!err) {
            return res.json({ data: doc })
        } else {
            return res.json({ message: err })
        }
    })

})

route.post('/getOwnerCustomer', (req, res) => {

    registration_sm.aggregate([
        {
            $lookup:{
                from:"partners",
                localField:'partner',
                foreignField:'_id',
                as:'partner'
            }
        },{
            $unwind:"$partner"
        },{
            $lookup:{
                from:"owners",
                localField:'owner',
                foreignField:'_id',
                as:'owner'
            }
        },{
            $unwind:"$owner"
        },{
            $project:{
                full_name:1,
                mobile:1,
                address:1,
                city:1,
                pin_code:1,
                partner_id:'$partner._id',
                partner_name:'$partner.full_name',
                owner_id:'$owner._id',
                owner_name:'$owner.full_name',
                ltr18:1,
                ltr20:1,
                totalAmount:1,
            }
        }
    ]).exec((err, doc) => {
        if (!err) {
            return res.json({ data: doc });
        } else {
            return res.json({ massege: "Bad request" })
        }
    })

    // registration_sm.find({ owner: req.body._id }, (err, doc) => {
    //     if (!err) {
    //         return res.json({ data: doc })
    //     } else {
    //        return res.json({ message: err })
    //     }
    // })

})

route.post('/getPartnerCustomer', (req, res) => {

    registration_sm.find({ partner: req.body._id }, (err, doc) => {
        if (!err) {
            return res.json({ data: doc })
        } else {
            return res.json({ message: err })
        }
    })

})

route.patch('/updateCustomer', (req, res) => {

    registration_sm.findByIdAndUpdate({ _id: req.body._id }, {

        full_name: req.body.full_name,
        mobile: req.body.mobile,
        address: req.body.address,
        city: req.body.city,
        pin_code: req.body.pin_code,
        owner: req.body.owner,
        partner: req.body.partner,
        ltr20: req.body.ltr20,
        ltr18: req.body.ltr18,

    }, (err, doc) => {
        if (!err) {
            registration_sm.findOne({ _id: req.body.id }, (err1, doc1) => {
                return res.json({ message: "data update successfully", data: doc1 })
            })
        } else {
            return res.json({ message: err })
        }
    })

})

route.post('/deleteCustomer', async (req, res) => {

    const doc = await registration_sm.findByIdAndDelete({ _id: req.body._id })

    if (doc) {
        return res.json({ message: "data delete successfully", data: doc })
    } else {
        return res.json({ message: "Bad Requiset" })
    }

})

module.exports = route  