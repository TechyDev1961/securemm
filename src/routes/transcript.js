// simple router to render our transcripts
const router = require("express").Router();
const { default: axios } = require("axios")
router.get("/direct/:cid/:messageid", async ( req, res ) => {
    let url = "https://cdn.discordapp.com/attachments/"
    const { cid, messageid } = req.params;
    url+=cid + "/" + messageid + "/transcript.html"
    const { data } = await axios.get(url).catch(e => res.status(404).send("Invalid Request"))
    res.status(200).send(data)
})
module.exports = router