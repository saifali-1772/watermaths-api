const mongoose = require("mongoose")

const url = "mongodb+srv://watermaths:watermaths123@watermaths.elkkx.mongodb.net/watermaths?retryWrites=true&w=majority"

mongoose.connect(url,{
    useNewUrlParser:true
}).then(()=>{console.log("mongoose is connect")})
.catch((e)=>{console.log(e)})

// module.exports = mongoose