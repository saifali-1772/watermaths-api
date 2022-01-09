// require dependencies
const express = require('express')
const route = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')

// use schema
const registration_sm = require('../../module/partner/registration_sm')
const jarRecord_sm = require('../../module/partner/jarRecord_sm')
const openingJar_sm = require('../../module/partner/openingJar_sm')

// owner jar recorde
const ownerJarRecord_sm = require('../../module/owner/jarRecord_sm')
const ownerRegistration_sm = require('../../module/owner/registration_sm')

// middleware
route.use(express.json())
route.use(express.urlencoded({ extended: true }))

route.post('/addPartnerJar', async (req, res) => {

    var fdate = new Intl.DateTimeFormat('ENG', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    })

    const openingJar_var = new openingJar_sm({
        partner: req.body.partner,
        date: fdate.format(new Date()),
        ltr18: req.body.ltr18,
        ltr20: req.body.ltr20,
    })

    registration_sm.findOne({ _id: req.body.partner }, (err, doc) => {
        if (!err) {
            ownerRegistration_sm.findOne({ _id: doc.owner }, (err1, doc1) => {
                if (!err1)
                    ownerRegistration_sm.findOneAndUpdate({ _id: doc.owner }, {
                        ltr18: parseInt(doc1.ltr18) - parseInt(req.body.ltr18),
                        ltr20: parseInt(doc1.ltr20) - parseInt(req.body.ltr20)
                    }, (err2, doc2) => {
                        if (!err2) {
                            registration_sm.findByIdAndUpdate({ _id: req.body.partner }, {
                                ltr18: parseInt(doc.ltr18) + parseInt(req.body.ltr18),
                                ltr20: parseInt(doc.ltr20) + parseInt(req.body.ltr20),
                            }, (err, doc) => {
                                if (!err) {
                                    openingJar_var.save((err3, doc3) => {
                                        if (!err3) return res.json({ status: res.statusCode,data: doc3 })
                                    })
                                } else {
                                    return res.json({
                                        data: {
                                            status: res.statusCode,
                                            message: "Record does not inserted"
                                        }
                                    })
                                }
                            })
                        }
                    })
            })
        } else {
            return res.send({ message: "Bad request" })
        }
    })
})

route.post('/getPartnerCurrentJar', (req, res) => {

    registration_sm.findOne({ _id: req.body._id }, (err, doc) => {
        if (!err) {
            return res.json({
                data: {
                    ltr18: doc.ltr18,
                    ltr20: doc.ltr20,
                    missing: doc.missing,
                    extra: doc.extra,
                }
            })
        } else {
            return res.json({ message: err })
        }
    })

})

// this useda in report
route.get('/getPartnerJar', (req, res) => {

    jarRecord_sm.find({ partner: req.body._id }, (err, doc) => {
        if (!err) {
            return res.json({ data: doc })
        } else {
            return res.json({ message: err })
        }
    })

})

// route.post('/deletePartnerJar', (req, res) => {

//     var fdate = new Intl.DateTimeFormat('ENG', {
//         month: 'short',
//         day: '2-digit',
//         year: 'numeric'
//     })

//     const jarRecord_var = new jarRecord_sm({

//         partner: req.body.partner,
//         date: fdate.format(new Date()),
//         ltr18: req.body.ltr18,
//         ltr20: req.body.ltr20,

//     })

//     // add jar on partner
//     registration_sm.findOne({ _id: req.body.partner }, (err, doc) => {

//         if (!err) {
//             var ltr20_var = doc.ltr20
//             var ltr18_var = doc.ltr18

//             registration_sm.findByIdAndUpdate({ _id: req.body.partner }, {
//                 ltr20: parseInt(ltr20_var) - parseInt(req.body.ltr20),
//                 ltr18: parseInt(ltr18_var) - parseInt(req.body.ltr18),
//             }, (err, doc) => {
//                 if (err) return res.json({ message: err })
//             })

//         } else {
//             return res.json({ message: err })
//         }

//         //  add jar on history
//         jarRecord_var.save((err, doc) => {
//             if (!err) {
//                 res.json({ message: "jar update in owner", data: doc })
//             } else {
//                 return res.json({ message: err })
//             }
//         })

//     })

// })

route.post('/deletePartnerJar', (req, res) => {
    var fdate = new Intl.DateTimeFormat('ENG', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    })

    const jarRecord_var = new jarRecord_sm({
        partner: req.body.partner,
        date: fdate.format(new Date()),
        ltr18: req.body.ltr18,
        ltr20: req.body.ltr20,
        missing: req.body.missing,
        extra: req.body.extra
    })

    registration_sm.findByIdAndUpdate({ _id: req.body.partner }, {
        ltr20: 0,
        ltr18: 0,
        missing: 0,
        extra: 0
    }, (err, doc) => {
        if (!err){
            jarRecord_var.save((err1, doc1) => {
                if (!err1) return res.json({ data: doc1 })
            })
        }else{
            return res.json({ message: err })
        } 
    })
})

route.get('/openingJars', (req, res) => {
    openingJar_sm.findOne({ partner: req.body._id }).sort({ _id: -1 }).exec((err, doc) => {
        if (!err) {
            return res.json({ data: doc })
        } else {
            return res.json({ error: err })
        }
    })
})

module.exports = route