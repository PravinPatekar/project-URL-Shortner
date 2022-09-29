const shortId= require('shortid')
const validUrl= require('valid-url')
const urlModel= require("../model/urlModel")


const urlShortner= async function(req,res){
 try{
    let {longUrl}=req.body
    if(!longUrl)return res.status(400).send({status:false,msg:"provide url"})
    if(!validUrl.isUri(longUrl))return res.status(400).send({status:false,msg:"invalid url"})
    let urlCode= shortId.generate()
    req.body.urlCode=urlCode
    const baseUrl="http://localhost:3000"
    if(!validUrl.isUri(baseUrl))return res.status(400).send({status:false,msg:"invalid baseUrl"})
    const shortUrl= baseUrl+'/'+urlCode
    console.log(shortUrl)
    res.send({msg:"dummy"})
 }
 catch(error){
return res.status(500).send({status:false,msg:error.message})

 } 
}
module.exports={urlShortner}