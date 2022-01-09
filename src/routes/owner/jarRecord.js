// require dependencies
const express = require('express')
const route = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')

// use schema
const registration_sm = require('../../module/owner/registration_sm')
const jarRecord_sm = require('../../module/owner/jarRecord_sm')


// middleware
route.use(express.json())
route.use(express.urlencoded({ extended: true }))

route.post('/addOwnerJar', (req, res) => {
    var fdate = new Intl.DateTimeFormat('ENG', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    })

    const jarRecord_var = new jarRecord_sm({
        owner: req.body.owner,
        date: fdate.format(new Date()),
        ltr20: req.body.ltr20,
        ltr18: req.body.ltr18,
        type: "Credit",
    })

    // add jar on owner
    registration_sm.findOne({ _id: req.body.owner }, (err, doc) => {
        if (!err) {
            registration_sm.findByIdAndUpdate({ _id: req.body.owner }, {
                ltr18: parseInt(doc.ltr18) + parseInt(req.body.ltr18),
                ltr20: parseInt(doc.ltr20) + parseInt(req.body.ltr20),
            }, (err, doc) => {
                if (!err) {
                    jarRecord_var.save((err1, doc1) => {
                        if (!err1) {
                            res.json({ message: "jar update in owner", data: doc1 })
                        } else {
                            return res.json({ message: err1 })
                        }
                    })
                } else {
                    return res.json({ message: err })
                }
            })
        } else {
            return res.json({ message: err })
        }
    })
})

route.post('/getOwnerCurrentJar', (req, res) => {

    registration_sm.findOne({ _id: req.body.id }, (err, doc) => {
        if (!err) {
            return res.json({
                data: {
                    id: doc._id,
                    ltr18: doc.ltr18,
                    ltr20: doc.ltr20,
                    missing: doc.missing,
                    extra: doc.extra
                }
            })
        } else {
            return res.json({ message: err })
        }
    })

})

route.get('/getOwnerJar', (req, res) => {

    jarRecord_sm.find({ owner: req.body.id }, (err, doc) => {
        if (!err) {
            return res.json({ data: doc })
        } else {
            return res.json({ message: err })
        }
    })

})

route.post('/deleteOwnerJar', (req, res) => {

    var fdate = new Intl.DateTimeFormat('ENG', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    })

    const jarRecord_var = new jarRecord_sm({

        owner: req.body.owner,
        date: fdate.format(new Date()),
        ltr20: req.body.ltr20,
        ltr18: req.body.ltr18,
        type: "Debit",

    })

    // add jar on owner
    registration_sm.findOne({ _id: req.body.owner }, (err, doc) => {

        if (!err) {
            var ltr20_var = doc.ltr20
            var ltr18_var = doc.ltr18

            registration_sm.findByIdAndUpdate({ _id: req.body.owner }, {
                ltr20: parseInt(ltr20_var) - parseInt(req.body.ltr20),
                ltr18: parseInt(ltr18_var) - parseInt(req.body.ltr18),
            }, (err, doc) => {
                if (err) return res.json({ message: err })
            })

        } else {
            return res.json({ message: err })
        }

        //  add jar on history
        jarRecord_var.save((err, doc) => {
            if (!err) {
                res.json({ message: "jar update in owner", data: doc })
            } else {
                return res.json({ message: err })
            }
        })

    })

})

route.post('/addDayJar', (req, res) => {

    var fdate = new Intl.DateTimeFormat('ENG', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    })

    const jarRecord_var = new jarRecord_sm({

        owner: req.body.owner,
        date: fdate.format(new Date()),
        ltr20: req.body.ltr20,
        ltr18: req.body.ltr18,
        missing: req.body.missing,
        extra: req.body.extra

    })

    jarRecord_var.save((err, doc) => {
        if (!err) {
            res.json({ data: doc })
        } else {
            return res.json({ message: err })
        }
    })

})

module.exports = route  