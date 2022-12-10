const shortid = require('shortid')
const validUrl = require('valid-url')
const urlModel = require("../model/urlModel")
const redis = require('redis')
const { promisify } = require("util")

const isValidUrl = function (value) {
    if (typeof value === "string" &&
        value.trim().length > 0 &&
        /^((https?|ftp):\/\/|(www|ftp)\.)[a-z0-9-]+(\.[a-z0-9-]+)+([\/?].*)?$/gim.test(value)
    )
        return true;
    return false;
};

// CONNECTING TO REDIS

const redisClient = redis.createClient(
    13631,  //port
    "redis-13631.c301.ap-south-1-1.ec2.cloud.redislabs.com",  //host
    { no_ready_check: true }
);
redisClient.auth("wyyIMitZQ2OeeYVP1arHZjBze790bVNX", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//<-------------------CREATING SHORTER URLs-------------------------->

const urlShortner = async function (req, res) {
    try {
        //GETTING LONGURL FROM REQ BODY
        let longUrl = req.body.longUrl
        if (!longUrl) {
            return res.status(400).send({ status: false, message: "Provide URL" })
        }
        if (!isValidUrl(longUrl)) {
            return res.status(400).send({ status: false, message: "Invalid URL" })
        }
        req.body.longUrl = longUrl.trim()

        //CHECKING IF URL IS ALREADY SHORTENED
        let findUrl = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, urlCode: 1, shortUrl: 1, _id: 0 });
        if (findUrl) {
            return res.status(200).send({ message: "This URL has already being shortened", data: findUrl })
        }

        //GENERATING URL CODE FOR LONG URLs
        let urlCode = shortid.generate().toLowerCase()
        req.body.urlCode = urlCode
        const baseUrl = "http://localhost:3000"
        if (!validUrl.isUri(baseUrl)) {
            return res.status(400).send({ status: false, message: "Invalid BaseUrl" })
        }

        //CREATING SHORT URL BY CONCATINATING WITH BASEURL
        const shortUrl = baseUrl + '/' + urlCode
        req.body.shortUrl = shortUrl

        //CREATING URL DOCUMENT IN DB
        const data = await urlModel.create(req.body)

        //SET THE DATA IN CACHE MEMORY
        await SET_ASYNC(`${urlCode}`, JSON.stringify(data));

        //RESPONSE BODY
        return res.status(201).send({ status: true, data: req.body })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

//<---------------------REDIRECTING URLs--------------------------->

const redirectingUrl = async function (req, res) {
    try {
        //GETTING URLCODE FROM PARAMS AND VALIDATING
        let urlCode = req.params.urlCode;
        if (!shortid.isValid(urlCode)) {
            return res.status(400).send({ status: false, message: "Invalid urlcode" })
        }

        //GETTING URL DATA FROM CACHE MEMORY AND PARSING IT TO JSON FORMAT
        const cachedUrl = await GET_ASYNC(`${urlCode}`)
        const parseUrl = JSON.parse(cachedUrl)
        console.log(parseUrl)
        if (parseUrl) {
            return res.status(302).redirect(parseUrl.longUrl)
        }

        //IF NOT PRESENT IN CACHE SEARCHING URL DATA IN DB
        let url = await urlModel.findOne({ urlCode: urlCode });
        if (!url) {
            return res
                .status(404)
                .send({ status: false, msg: ` Document with this Urlcode:${urlCode} not Found..` })
        }
        await SET_ASYNC(`${urlCode}`, JSON.stringify(url));
        return res.status(302).redirect(url.longUrl)

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { urlShortner, redirectingUrl }