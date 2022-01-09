// require dependencies
const express = require('express')
const route = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')    
const bcrypt = require('bcrypt')

// use schema
const registration_sm = require('../../module/customer/customerReg_sm')
const jarAmount_sm = require('../../module/customer/jarAmount_sm')

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

route.post('/addAmount',(req,res)=>{

    var fdate = new Intl.DateTimeFormat('ENG', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    })

    let jarAmount_var = new jarAmount_sm({
        customer : req.body.id,
        date: fdate.format(new Date()),
        amount : req.body.amount,
        amountType : req.body.amountType,
    })

    registration_sm.findOne({_id:req.body.id},(err,doc)=>{ if(!err)
        registration_sm.findOneAndUpdate({_id:req.body.id},{
            totalAmount : doc.totalAmount - req.body.amount
        },(err1,doc1)=>{ if(!err1)
            jarAmount_var.save((err2,doc2)=>{ if(!err2)
                return res.json({data:doc2}) 
                else return res.json({error:err2})
            })
        })
    })

})

route.get('/getPaidAmount',(req,res)=>{
    jarAmount_sm.find({customer:req.body.id},(err,doc)=>{ if(!err)
        return res.json({data:doc})
        else return res.json({error:err})
    })
})

module.exports = route  