const express = require("express")
const router = express.Router()

const urlController=require("../controller/urlController")


router.post('/url/shorten',urlController.urlShortner)













router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Invalid Url"
    })
})

module.exports = router;