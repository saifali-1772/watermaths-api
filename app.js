// connect to database
require('./src/config/db')
 
// require dependencies
const express = require("express")
const cors = require("cors")
const app = express()
var port = process.env.PORT || 4000

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

// image file connect
app.use('/images', express.static('images'))

// Define route
const owner = require('./src/routes/owner/registration')
const partner = require('./src/routes/partner/registration')
const customer = require('./src/routes/customer/registration')
const ownerjarRecord = require('./src/routes/owner/jarRecord')
const partnerjarRecord = require('./src/routes/partner/jarRecord')
const customerjarRecord = require('./src/routes/customer/jarRecord')
const ownerForgot = require('./src/routes/owner/forgot')
const jarAmount = require('./src/routes/customer/jarAmount')

// use route
app.get('/', (req, res) => {
    res.send("welcome to watermaths"+port)
})
app.use('/api', owner)
app.use('/api', partner)
app.use('/api', customer)
app.use('/api', ownerjarRecord)
app.use('/api', partnerjarRecord)
app.use('/api', customerjarRecord)
app.use('/api', ownerForgot)
app.use('/api', jarAmount)

 // server
app.listen(port, () => { console.log("Server Start on port " + port) })