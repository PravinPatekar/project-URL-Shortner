const express = require("express")
const mongoose = require("mongoose")
const route = require("./route/routes")
const app = express()

app.use(express.json())

mongoose.connect("mongodb+srv://kamrebaba:ironman@cluster0.lvfp80k.mongodb.net/group7Database",{
    useNewUrlParser: true
})

.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.route("/", route)

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});