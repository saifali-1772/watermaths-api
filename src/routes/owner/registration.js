// require dependencies
const express = require('express')
const route = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')

// use schema
const registration_sm = require('../../module/owner/registration_sm')

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


// add owner
route.post('/addOwner', (req, res) => {

    const registration_var = new registration_sm({

        company_name: req.body.company_name,
        full_name: req.body.full_name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: req.body.password,
        address: req.body.address,
        city: req.body.city,
        pin_code: req.body.pin_code,
        ltr20: '0',
        ltr18: '0',
        missing: '0',
        extra: '0',

    })

    // reg.generateAuthToken()

    registration_var.save((err, doc) => {
        if (!err) {
            // res.status(200).send("User Page");
            return res.json({
                data: {
                    status: res.statusCode,
                    company_name: doc.company_name,
                    full_name: doc.full_name,
                    email: doc.email,
                    mobile: doc.mobile,
                    password: doc.password,
                    id: doc._id
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

route.get('/getOwner', (req, res) => {

    registration_sm.find((err, doc) => {
        if (!err) {
            return res.json({ data: doc })
        } else {
            return res.json({ message: err })
        }
    })

})

route.patch('/updateOwner', (req, res) => {

    bcrypt.hash(req.body.password, 10, (err, hash) => {
        registration_sm.findByIdAndUpdate({ _id: req.body.id }, {
            company_name: req.body.company_name,
            full_name: req.body.full_name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: hash,
        }, (err, doc) => {
            if (!err) {
                registration_sm.findOne({ _id: req.body.id }, (err1, doc1) => {
                    if (!err1) return res.json({ message: "data update successfully", data: doc1 })
                })
            } else {
                return res.json({ message: err })
            }
        })
    })

})

route.post('/deleteOwner', async (req, res) => {

    const doc = await registration_sm.findByIdAndDelete({ _id: req.body.id })

    if (doc) {
        return res.json({ message: "data delete successfully", data: doc })
    } else {
        return res.json({ message: "Bad Requiset" })
    }

})

route.post('/ownerLogin', (req, res) => {

    registration_sm.findOne({ email: req.body.email }, (err, doc) => {
        bcrypt.compare(req.body.password, doc.password, (err, rus) => {
            if (rus) {
                return res.json({
                    data: {
                        company_name: doc.company_name,
                        full_name: doc.full_name,
                        email: doc.email,
                        mobile: doc.mobile,
                        password: doc.password,
                        id: doc._id
                    }
                })
            } else {
                return res.json({ massege: "Bad Requiset" })
            }
        })
    })

})

module.exports = route  