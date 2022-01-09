// require dependencies
const express = require('express')
const route = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const otpGenerator = require("otp-generator");
const session = require('express-session')
const ejs = require('ejs')

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

// session setup
route.use(session({
    secret: 'watermaths-session',
    resave: true,
    saveUninitialized: true
}))

// var template = fs.readFileSync('./src/routes/owner/index.html',{encoding:'utf-8'});
var template_ejs = fs.readFileSync('./views/index.ejs',{encoding:'utf-8'});

route.post('/sendOtp', (req, res) => {

    registration_sm.findOne({ email: req.body.email }, (err, doc) => {
        if (!err) {
            const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false, digits: true });
            const ttl = 2 * 60 * 1000; // 2 mint
            const expires = Date.now() + ttl;
            const data = `${doc.email}.${otp}.${expires}`;

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'saifalishaikh.business@gmail.com',
                    pass: '9588601260'
                }
            });

            var text_var = ejs.render(template_ejs,{ data : otp });

            var mailOptions = {
                from: '"Watermaths"saifalishaikh.business@gmail.com',
                to: doc.email,
                subject: 'Verify your email on Watermaths',
                // text: `Use code ${otp} to reset your password.`
                html: text_var
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return res.json(error);
                } else {
                    return res.json('Email sent: ' + info.response);
                    // return res.json({ expires: expires })
                }
            });

            req.session.expires = expires
            req.session.otp = otp
            req.session.email = doc.email

        } else {
            return res.json({ error: err })
        }
    })

})

route.post('/verifyOtp', (req, res) => {

    if (Date.now() > parseInt(req.session.expires)) {
        return res.json({ message: "Bad request" })
    } else {
        if (req.body.otp == req.session.otp) {
            return res.json({ message: "otp is correct" })
        } else {
            return res.json({ message: "Bad request" })
        }
    }

})

route.patch('/ownerNewPassword', async (req, res) => {

    password_var = await bcrypt.hash(req.body.password, 10)

    registration_sm.findOneAndUpdate({ email: req.session.email }, {
        password: password_var
    }, (err, doc) => {
        if (!err) {
            // return res.json({data:doc})
            return res.json({ message: "Password update successfully" })
        } else {
            return res.json({ message: "bad request" })
        }
    })

})

// route.post('/whatsapp', (req, res) => {
//     var user = '12ab3456';
//     var password = '123AbcdefghIJklM';
//     var from_number = '14151234567';
//     var to_number = '441234567890';

//     const data = JSON.stringify({
//         "from": { "type": "whatsapp", "number": from_number },
//         "to": { "type": "whatsapp", "number": to_number },
//         "message": {
//             "content": {
//                 "type": "text",
//                 "text": "Hi! Your lucky number is " + Math.floor(Math.random() * 100)
//             }
//         }
//     });
// })



module.exports = route