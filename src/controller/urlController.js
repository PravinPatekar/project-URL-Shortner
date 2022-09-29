const shortId = require('shortid')
const validUrl = require('valid-url')
const urlModel = require("../model/urlModel")


const urlShortner = async function (req, res) {
    try {
        let  longUrl  = req.body.longUrl
        if (!longUrl) return res.status(400).send({ status: false, msg: "provide url" })
        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, msg: "invalid url" })
        let findUrl  = await urlModel.findOne({longUrl: longUrl}).select({longUrl : 1 , urlCode : 1 , shortUrl : 1 , _id : 0});
        if(findUrl){
            return res.status(409).send({message : "This URL has already being shortened" , data : findUrl})
        }
        let urlCode = shortId.generate().toLowerCase()
        req.body.urlCode = urlCode
        const baseUrl = "http://localhost:3000"
        if (!validUrl.isUri(baseUrl)) return res.status(400).send({ status: false, msg: "invalid baseUrl" })
        const shortUrl = baseUrl + '/' + urlCode
        console.log(shortUrl)
        req.body.shortUrl = shortUrl
        const data = await urlModel.create(req.body)
        return res.status(201).send({ status: true, msg:req.body })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const getUrl = async function(req , res){
    try{
        let urlcode = req.params.urlCode;
        if(!shortid.isValid(urlcode)){
            return res.status(400).send({ status: false, msg: "invalid urlcode" })
        }
        let url = await urlModel.findOne({urlCode : urlcode});
        if(!url){
            return res
        .status(404)
        .send({ status: false, msg: "url Document not Found" })

        }
        return res.status(200).redirect(url.longUrl)

    }catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { urlShortner , getUrl }