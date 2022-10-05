const express = require("express")
const router = express.Router()

const urlController=require("../controller/urlController")

//-----------------(URL Shortening API)----------------------

router.post('/url/shorten',urlController.urlShortner)

//-----------------(Redirecting API)

router.get("/:urlCode" , urlController.redirectingUrl)

router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Endpoint is not correct"
    })
})

module.exports = router;