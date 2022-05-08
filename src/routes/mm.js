const router = require("express").Router();
const mm = require("../database/mm");
const moment = require("moment");
const { getMmList, sendMessage, sendMsg } = require('../wrap');
let requestMmRatelimit = new Set();
let vouchRateLimit = new Set();
const middleWare = ( req, res, next ) => {
    if (!req.user) {
        return res.status(401).send({ message: "Unauthorized" })
    }
    next()
}
router.use(middleWare)
router.get("/getmiddlemans", async ( req, res ) => {
    let mms = await getMmList()
    res.status(200).send({ mms: mms })
})
router.post("/request/middleman", async ( req, res ) => {
    if (requestMmRatelimit.has(req.user)) return res.status(429).send({ success: false, message: "You are being ratelimited" })
    const { mmId, currency, product } = req.body;
    const { username, userId } = req.user;
    res.status(201).send({ success: true, message: "MM request created"})
    await sendMessage(mmId, product, currency, username, userId).catch(e => null)
    await requestMmRatelimit.add(req.user)
    setTimeout(() => {
        await requestMmRatelimit.delete(req.user)
    }, 300000)
});

router.post("/feedback/:mmid", async ( req, res ) => {
    if (vouchRateLimit.has(req.user)) return res.status(429).send({ success: false, message: "You are being ratelimited" })
    const { mmid } = req.params;
    const { comment } = req.body;
    const { username, userId } = req.user
    const foundMm = await mm.findOne({ userId: mmid })
    if (!foundMm) return res.status(404).send({ message: "Mm not found" })
    const vouchId = Math.random().toString().substring(12)
    await mm.updateOne({ userId: mmid }, { $push: { vouches: {
        username,
        userId,
        comment,
        time: moment().format(),
        vouchId: vouchId
    } } })
    await sendMsg(mmid, userId, username, comment, vouchId)
    res.status(201).send({ success: true, message: "Feedback sent" })
    await vouchRateLimit.add(req.user)
    setTimeout(() => {
        await vouchRateLimit.delete(req.user)
    }, 120000)
})
router.get("/getmm/:mmid", async ( req, res ) => {
    const { mmid } = req.params;
    const foundMm = await mm.findOne({ userId: mmid })
    if (!foundMm) return res.status(404).send({ message: "Mm not found" })
    res.status(200).send({ mm: foundMm })
})
module.exports = router