// require dependencies
const express = require('express')
const route = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

// use schema
const registration_sm = require('../../module/partner/registration_sm')


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


// add partner
route.post('/addPartner', (req, res) => {

    const registration_var = new registration_sm({

        username: req.body.full_name.replace(/ /g, "").substring(0, 5).toLowerCase() + "_" + crypto.randomInt(0, 10000),
        full_name: req.body.full_name,
        partner_email: req.body.partner_email,
        mobile: req.body.mobile,
        password: req.body.full_name[0].toUpperCase() + req.body.full_name.replace(/ /g, "").substring(1, 5).toLowerCase() + "@123",
        address: req.body.address,
        owner: req.body.owner,
        city: req.body.city,
        pin_code: req.body.pin_code,
        dob: req.body.dob,
        ltr18: 0,
        ltr20: 0,
        missing: 0,
        extra: 0

    })

    // reg.generateAuthToken()
    registration_var.save((err, doc) => {
        if (!err) {
            return res.json({
                data: {
                    status: res.statusCode,
                    _id: doc._id,
                    full_name: doc.full_name,
                    partner_email: doc.partner_email,
                    mobile: doc.mobile,
                    address: doc.address,
                    city: doc.city,
                    pin_code: doc.pin_code,
                    dob: doc.dob
                }
            })
        } else {
            if (err.keyPattern.email == 1) return res.json({
                data: {
                    status: 204,
                    message: "This email is already exist"
                }
            })
            if (err.keyPattern.mobile == 1) return res.json({
                data: {
                    status: 204,
                    message: "This phone no is already exist"
                }
            })
            return res.json({ message: err })
        }
    })

})

route.get('/getPartner', (req, res) => {

    registration_sm.find((err, doc) => {
        if (!err) {
            return res.json({ data: doc })
        } else {
            return res.json({ message: err })
        }
    })

})

// get customes owner 
route.post('/getAdminPartner', (req, res) => {

    registration_sm.find({ owner: req.body._id }, (err, doc) => {
        if (!err) {
            return res.json({ data: doc })
        } else {
            return res.json({ message: err })
        }
    })

})
 
// incomplete API
route.patch('/updatePartner', (req, res) => {

    bcrypt.hash(req.body.password, 10, (err, hash) => {
        registration_sm.findByIdAndUpdate({ _id: req.body._id }, {
            // username:req.body.username.replace(/ /g, ""),
            full_name: req.body.full_name,
            partner_email: req.body.partner_email,
            mobile: req.body.mobile,
            password: hash,
            address: req.body.address,
            city: req.body.city,
            owner: req.body.owner,
            pin_code: req.body.pin_code,
            dob: req.body.dob
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

})

route.post('/deletePartner', async (req, res) => {

    const doc = await registration_sm.findByIdAndDelete({ _id: req.body._id })

    if (doc) {
        return res.json({ message: "data delete successfully", data: doc })
    } else {
        return res.json({ message: "Bad Requiset" })
    }

})

route.post('/partnerLogin', (req, res) => {

    registration_sm.findOne({ username: req.body.username }, (err, doc) => {
        bcrypt.compare(req.body.password, doc.password, (err, rus) => {
            if (rus) {
                return res.json({ data: doc })
            } else {
                return res.json({ massege: "Bad Requiset" })
            }
        })
    })

})

// wifi password : 9ktnkxjpny

// const unirest = require('unirest')
// const request = unirest("POST", "https://www.fast2sms.com/dev/bulk");

// route.post('/sendMessage', (req, res) => {

//     const OTP = Math.floor(1000 + Math.random() * 9000);
//     request.headers({
//         authorization: 'fnTT3KWMzAwvMg9poZ4dwGU70ODXJiSX6h6LXo8YFfPVdlkmVz7tsn7VRrD2'
//     });

//     request.form({
//         sender_id: "FSTSMS", // Set your own "sender_id"
//         message: "16361", // template id
//         language: "english",
//         route: "qt", // Transactional Route SMS
//         variables: "{#AA#}",
//         variables_values: OTP,
//         numbers: req.body.number // Number present in GET request
//     });

//     request.end(function (res) {
//         if (res.error) console.log("error at otp");
//         console.log(res.body);
//     });
//     // response send back
//     res.send({
//         Number: req.body.number,
//         OTP: OTP
//     });

// })

module.exports = route  