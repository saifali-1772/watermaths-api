// incomplete api's

// require dependencies
const express = require('express')
const route = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const translate = require('translate')
// const translate = require('google-translate-api')

// use schema
const registration_sm = require('../../module/customer/customerReg_sm')
const jarRecord_sm = require('../../module/customer/jarRecord_sm')

const partner_reg = require('../../module/partner/registration_sm')
const openingJar_sm = require('../../module/partner/openingJar_sm')

// middleware
route.use(express.json())
route.use(express.urlencoded({ extended: true }))

// var empty_jar = 0

route.post('/addCustomerJar', async (req, res) => {

    var fdate = new Intl.DateTimeFormat('ENG', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    })

    registration_sm.findOne({ _id: req.body.customer }, (err, doc) => {
        if (!err) {
            partner_reg.findOne({ _id: doc.partner }, (err1, doc1) => {
                openingJar_sm.findOne({ partner: doc.partner }).sort({ _id: -1 }).exec((err2, doc2) => {
                    if (!err) {
                        var missing_var = 0
                        var extra_var = 0
                        var stock_18
                        var stock_20

                        // empty_jar += parseInt(req.body.empty_18) + parseInt(req.body.empty_20)
                        var ltr18_var = (doc1.ltr18 - parseInt(req.body.filled_18)) + parseInt(req.body.empty_18)
                        var ltr20_var = (doc1.ltr20 - parseInt(req.body.filled_20)) + parseInt(req.body.empty_20)
                        // var missing_var = doc1.missing + parseInt(req.body.stock_18) + parseInt(req.body.stock_20)
                        // var extra_var = doc1.extra
                        var total_var = ltr18_var + ltr20_var
                        let customerTA = doc.totalAmount + ((parseInt(req.body.filled_18) * doc.ltr18) + (parseInt(req.body.filled_20) * doc.ltr20))

                        if (total_var <= (parseInt(doc2.ltr18) + parseInt(doc2.ltr20))) {
                            missing_var = (parseInt(doc2.ltr18) + parseInt(doc2.ltr20)) - total_var
                        } else {
                            extra_var = total_var - (parseInt(doc2.ltr18) + parseInt(doc2.ltr20))
                        }

                        if (req.body.filled_18 > (req.body.empty_18 + req.body.stock_18)) {
                            stock_18 = req.body.filled_18 - (parseInt(req.body.empty_18) + parseInt(req.body.stock_18))
                        } else {
                            stock_18 = req.body.stock_18
                        }

                        if (req.body.filled_20 > (req.body.empty_20 + req.body.stock_20)) {
                            stock_20 = req.body.filled_20 - (parseInt(req.body.empty_20) + parseInt(req.body.stock_20))
                        } else {
                            stock_20 = req.body.stock_20
                        }

                        console.log(customerTA)

                        const jarRecord_var = new jarRecord_sm({

                            customer: req.body.customer,
                            date: fdate.format(new Date()),
                            filled_18: req.body.filled_18,
                            empty_18: req.body.empty_18,
                            stock_18: stock_18,
                            filled_20: req.body.filled_20,
                            empty_20: req.body.empty_20,
                            stock_20: stock_20,

                        })

                        // console.log({
                        //     data: { 
                        //         ltr18: ltr18_var,
                        //         ltr20: ltr20_var,
                        //         total: total_var,
                        //         missing: missing_var,
                        //         extra: extra_var,
                        //         // empty: empty_jar
                        //     }
                        // })

                        partner_reg.findByIdAndUpdate({ _id: doc.partner }, {
                            ltr18: ltr18_var,
                            ltr20: ltr20_var,
                            missing: missing_var,
                            extra: extra_var
                        }, (err3, doc3) => {
                            if (!err3) {
                                //  add jar on history
                                registration_sm.findByIdAndUpdate({ _id: req.body.customer }, {
                                    totalAmount: customerTA
                                }, (err5) => {
                                    if (!err5)
                                        jarRecord_var.save((err4, doc4) => {
                                            if (!err4) {
                                                return res.json({ data: doc4 })
                                            }
                                        })
                                })
                                // res.json({ data: doc3 })
                            }
                        })
                    }
                })
            })
        } else {
            return res.json({ massege: err })
        }
    })

})
 
route.post('/updateCustomerJar', (req, res) => {

    registration_sm.findOne({ _id: req.body.id }, (err, doc) => {
        if (!err) {
            partner_reg.findOne({ _id: doc.partner }, (err1, doc1) => {
                openingJar_sm.findOne({ partner: doc.partner }).sort({ _id: -1 }).exec((err2, doc2) => {
                    if (!err) {
                        jarRecord_sm.findOne({ customer: req.body.id }).sort({ _id: -1 }).exec((err5, doc5) => {
                            var missing_var = 0
                            var extra_var = 0

                            //             //             empty_jar += parseInt(req.body.empty_18) + parseInt(req.body.empty_20)
                            var ltr18_var = (doc1.ltr18 - parseInt(req.body.filled_18)) + parseInt(req.body.empty_18)
                            var ltr20_var = (doc1.ltr20 - parseInt(req.body.filled_20)) + parseInt(req.body.empty_20)
                            //             //             // var missing_var = doc1.missing + parseInt(req.body.stock_18) + parseInt(req.body.stock_20)
                            //             //             // var extra_var = doc1.extra
                            var total_var = ltr18_var + ltr20_var

                            var customerTA = doc.totalAmount
                            if (doc5.filled_18 > req.body.filled_18) {
                                customerTA -= ((doc5.filled_18 - req.body.filled_18) * doc.ltr18)
                            } else {
                                customerTA += ((req.body.filled_18 - doc5.filled_18) * doc.ltr18)
                            }
                            if (doc5.filled_20 > req.body.filled_20) {
                                customerTA -= ((doc5.filled_20 - req.body.filled_20) * doc.ltr20)
                            } else {
                                customerTA += ((req.body.filled_20 - doc5.filled_20) * doc.ltr20)
                            }

                            if (total_var <= (doc2.ltr18 + doc2.ltr20)) {
                                missing_var = (doc2.ltr18 + doc2.ltr20) - total_var
                            } else {
                                extra_var = total_var - (doc2.ltr18 + doc2.ltr20)
                            }

                            if (req.body.filled_18 > (req.body.empty_18 + req.body.stock_18)) {
                                stock_18 = req.body.filled_18 - (parseInt(req.body.empty_18) + parseInt(req.body.stock_18))
                            } else {
                                stock_18 = req.body.stock_18
                            }

                            if (req.body.filled_20 > (req.body.empty_20 + req.body.stock_20)) {
                                stock_20 = req.body.filled_20 - (parseInt(req.body.empty_20) + parseInt(req.body.stock_20))
                            } else {
                                stock_20 = req.body.stock_20
                            }

                            // res.json({
                            //     data: {
                            //         ltr18: ltr18_var,
                            //         ltr20: ltr20_var,
                            //         total: total_var,
                            //         missing: missing_var,
                            //         extra: extra_var,
                            //         // empty: empty_jar
                            //     }
                            // })

                            partner_reg.findByIdAndUpdate({ _id: doc.partner }, {
                                ltr18: ltr18_var,
                                ltr20: ltr20_var,
                                missing: missing_var,
                                extra: extra_var
                            }, (err3, doc3) => {
                                if (!err3) {
                                    jarRecord_sm.findOne({ customer: req.body.id }).sort({ _id: -1 }).exec((err4, doc4) => {
                                        if (!err4) {
                                            jarRecord_sm.findByIdAndUpdate({ _id: doc4._id }, {
                                                filled_18: req.body.filled_18,
                                                empty_18: req.body.empty_18,
                                                stock_18: stock_18,
                                                filled_20: req.body.filled_20,
                                                empty_20: req.body.empty_20,
                                                stock_20: stock_20,
                                            }, (err5, doc5) => {
                                                if (!err5)
                                                    registration_sm.findByIdAndUpdate({ _id: req.body.id }, {
                                                        totalAmount: customerTA
                                                    }, (err6) => {
                                                        if (!err6) {
                                                            // return res.json({ data: doc5 })
                                                            return res.json({ message: "update record successfully" })
                                                        } else {
                                                            return res.json({ error: err6 })
                                                        }
                                                    })
                                            })
                                            // res.json({ data: doc4.customer })        
                                        }
                                    })
                                }
                            })
                            // return res.json({ data: doc2 })
                        })
                    }
                })
            })
        } else {
            return res.json({ massege: err })
        }
    })
})

route.post('/blankCustomerJar', (req, res) => {
    var fdate = new Intl.DateTimeFormat('ENG', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    })

    const jarRecord_var = new jarRecord_sm({
        customer: req.body.id,
        date: fdate.format(new Date()),
        filled_18: 0,
        empty_18: 0,
        stock_18: 0,
        filled_20: 0,
        empty_20: 0,
        stock_20: 0,
    })

    jarRecord_var.save((err, doc) => {
        if (!err) return res.json({ status: res.statusCode, data: doc })
        else return res.json({ message: "Bad requset" })
    })

})

route.get('/getCustomerJar', (req, res) => {

    jarRecord_sm.find({ customer: req.body.id }).sort({ _id: -1 })
        .exec((err, doc) => {
            if (!err) {
                return res.json({ data: doc })
            } else {
                return res.json({ message: err })
            }
        })

    // jarRecord_sm.findOne({ customer: req.body.id }).sort({_id:-1})
    // .exec((err, doc) => {
    //     if (!err) {
    //         console.log(doc.customer)
    //         return res.json({ data: doc })
    //     } else {
    //         return res.json({ message: err })
    //     }
    // })

})

route.get('/getTotalAmount',(req,res)=>{
    registration_sm.findOne({_id:req.body.id},(err,doc)=>{
        if(!err)
            return res.json({totalAmount:doc.totalAmount})
    })
    // registration_sm.findOneAndUpdate({_id:req.body.id},{
    //     totalAmount:0
    // },(err,doc)=>{
    //     if(!err) return res.send("good")
    // })
})



route.get('/translate', async (req, res) => {
    translate.engine = "google";
    translate.key = 'watermaths';

    const text = await translate("Kharadi pune-411003", "hi");
    res.json(text);
})

module.exports = route  